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
          bio: bio || 'Resident sketch artist and visual storyteller exploring depth and light.',
          specialization: specialization || 'Pencil Realism & Sketches',
          experience: experience || 'Self-taught artist',
          profileImage: profileImage || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
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

// Helper to automatically ensure that admins, managers, and artists have a linked Artist profile
const ensureArtistProfile = async (user) => {
  if ((user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'ARTIST') && !user.artistId) {
    const createdArtist = await prisma.artist.create({
      data: {
        name: user.name,
        bio: 'Artist bio is empty. Please edit profile to customize.',
        specialization: user.role === 'SUPER_ADMIN' ? 'Gallery Director' : 'Fine Art Curator',
        experience: 'Team Member',
        profileImage: user.avatar || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
        socialLinks: { instagram: '', behance: '' }
      }
    });

    const updatedUser = await prisma.user.update({
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
      where: { email },
      include: {
        artist: {
          select: { profileImage: true }
        }
      }
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // Auto-ensure profile for admin/artist roles on login
      user = await ensureArtistProfile(user);

      // Resolve profile image: Artist.profileImage takes priority over User.avatar
      const profileImage = user.artist?.profileImage || user.avatar || null;

      console.log(`[Login] User: ${user.email} | Artist.profileImage: ${user.artist?.profileImage} | Resolved: ${profileImage}`);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profileImage,          // ← The single consistent field frontend should use
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
      select: { id: true, name: true, email: true, phone: true, avatar: true, address: true, role: true, artistId: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also resolve profileImage from the linked Artist record
    let profileImage = user.avatar;
    if (user.artistId) {
      const artist = await prisma.artist.findUnique({
        where: { id: user.artistId },
        select: { profileImage: true }
      });
      if (artist?.profileImage) profileImage = artist.profileImage;
    }

    res.json({ ...user, profileImage });
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

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, artistId: true },
    });

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
      // Provision user
      const finalRole = role === 'ARTIST' ? 'ARTIST' : 'USER';
      
      let createdArtist = null;
      if (finalRole === 'ARTIST') {
        createdArtist = await prisma.artist.create({
          data: {
            name,
            bio: 'Artist bio is empty. Please edit profile to customize.',
            specialization: 'Custom Artworks',
            experience: 'New Artist',
            profileImage: picture || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
            socialLinks: { instagram: '', behance: '' }
          }
        });
      }

      // Provision user with random secure password and authProvider set to "google"
      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: finalRole,
          avatar: picture,
          authProvider: 'google',
          artistId: createdArtist ? createdArtist.id : null
        }
      });
    } else {
      // If user exists:
      // 1. Upgrade from USER to ARTIST if logging into curator portal
      if (role === 'ARTIST' && user.role === 'USER') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ARTIST' }
        });
      }
      
      // 2. Ensure authProvider matches if logging in via Google
      if (user.authProvider !== 'google') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { authProvider: 'google', avatar: user.avatar || picture }
        });
      }
    }

    // 3. Guarantee artist profile exists if role is admin/artist
    user = await ensureArtistProfile(user);

    // Resolve profile image from linked artist if it exists
    let profileImage = user.avatar || picture;
    if (user.artistId) {
      const artistRecord = await prisma.artist.findUnique({
        where: { id: user.artistId },
        select: { profileImage: true }
      });
      if (artistRecord?.profileImage) profileImage = artistRecord.profileImage;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || picture,
      profileImage,          // ← The single consistent field frontend should use
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
