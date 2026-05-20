const prisma = require('../utils/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyGoogleToken } = require('../services/googleAuthService');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, bio, specialization, experience, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let createdArtist = null;
    let finalRole = role === 'ARTIST' ? 'ARTIST' : 'USER';

    if (finalRole === 'ARTIST') {
      createdArtist = await prisma.artist.create({
        data: {
          name,
          bio: '',
          specialization: '',
          experience: '',
          socialLinks: { instagram: '', behance: '' }
        }
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: finalRole,
        profileImage: profileImage || null,
        artistId: createdArtist ? createdArtist.id : null
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper to automatically ensure that SUPER_ADMIN accounts have a linked Artist profile
// Regular ARTIST accounts get their profile created at registration time
const ensureArtistProfile = async (user) => {
  if (user.role === 'SUPER_ADMIN' && !user.artistId) {
    const createdArtist = await prisma.artist.create({
      data: {
        name: user.name,
        bio: '',
        specialization: 'Gallery Director',
        experience: '',
        socialLinks: { instagram: '', behance: '' }
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { artistId: createdArtist.id }
    });

    user.artistId = createdArtist.id;
  }
  return user;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // Auto-ensure profile for admin/artist roles on login
      user = await ensureArtistProfile(user);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        artistId: user.artistId,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, profileImage: true, address: true, role: true, artistId: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const path = require('path');

    // Handle profile image upload
    let profileImage = undefined;
    if (req.file) {
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        profileImage = req.file.path;
      } else {
        profileImage = `/uploads/profiles/${path.basename(req.file.path)}`;
      }
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(profileImage !== undefined && { profileImage }),
    };

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, address: true, profileImage: true, role: true, artistId: true },
    });

    // Keep linked artist profile in sync
    if (profileImage !== undefined && updated.artistId) {
      await prisma.artist.update({
        where: { id: updated.artistId },
        data: {
          ...(profileImage !== undefined && { profileImage }),
          ...(name !== undefined && { name }),
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user via Google ID Token
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify token using official google-auth-library service
    const googleProfile = await verifyGoogleToken(token);
    const { email, name, picture } = googleProfile;

    if (!email) {
      return res.status(400).json({ message: 'Google account did not return a valid email address.' });
    }

    // Resolve or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Provision new user
      const finalRole = role === 'ARTIST' ? 'ARTIST' : 'USER';
      
      let createdArtist = null;
      if (finalRole === 'ARTIST') {
        createdArtist = await prisma.artist.create({
          data: {
            name,
            bio: '',
            specialization: '',
            experience: '',
            socialLinks: { instagram: '', behance: '' }
          }
        });
      }

      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: finalRole,
          profileImage: picture || null,
          authProvider: 'google',
          artistId: createdArtist ? createdArtist.id : null
        }
      });
    } else {
      // Existing user — sync Google picture if they haven't set a custom one
      const updateData = {
        authProvider: 'google',
        ...(picture && (!user.profileImage || user.profileImage.startsWith('https://lh3.googleusercontent.com') || user.profileImage.startsWith('https://googleusercontent.com')) && { profileImage: picture }),
      };

      // Upgrade from USER to ARTIST if logging into curator portal and they don't have an artist profile yet
      if (role === 'ARTIST' && user.role === 'USER') {
        updateData.role = 'ARTIST';
        // Create a blank artist profile for them
        if (!user.artistId) {
          const newArtist = await prisma.artist.create({
            data: {
              name: user.name,
              bio: '',
              specialization: '',
              experience: '',
              socialLinks: { instagram: '', behance: '' }
            }
          });
          updateData.artistId = newArtist.id;
        }
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
    }

    // 3. Guarantee artist profile exists if role is admin/artist
    user = await ensureArtistProfile(user);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      artistId: user.artistId,
      authProvider: user.authProvider,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error('Google Auth Controller Error:', error.message);
    res.status(400).json({ message: error.message || 'Google Authentication failed' });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
};
