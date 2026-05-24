const prisma = require('../utils/prismaClient');

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
const getArtists = async (req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true
          }
        },
        artworks: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        highlights: {
          orderBy: { order: 'asc' }
        }
      }
    });

    const mapped = artists.map(a => ({
      ...a,
      userId: a.user?.id || null,
      email: a.user?.email || null,
      profileImage: a.user?.profileImage || a.profileImage || null,
      user: undefined
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get artist by ID
// @route   GET /api/artists/:id
// @access  Public
const getArtistById = async (req, res) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true
          }
        },
        artworks: true,
        highlights: {
          include: {
            items: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (artist) {
      const mapped = {
        ...artist,
        userId: artist.user?.id || null,
        email: artist.user?.email || null,
        profileImage: artist.user?.profileImage || artist.profileImage || null,
        user: undefined
      };
      res.json(mapped);
    } else {
      res.status(404).json({ message: 'Artist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create an artist
// @route   POST /api/artists
// @access  Private
const createArtist = async (req, res) => {
  try {
    const { name, username, bio, website, location, specialization, experience, socialLinks } = req.body;
    
    let profileImage = '';
    if (req.file) {
      const path = require('path');
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        profileImage = req.file.path;
      } else {
        profileImage = `/uploads/profiles/${path.basename(req.file.path)}`;
      }
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        username,
        bio,
        website,
        location,
        specialization,
        experience,
        profileImage: profileImage || null,
        socialLinks: socialLinks ? JSON.parse(socialLinks) : null,
      }
    });

    // If a profile image is provided during manual artist creation, try to link it to a user if one gets created later,
    // but since we removed Artist.profileImage, we can only update the User if it exists.
    // However, createArtist doesn't have a linked user yet. So we just ignore the upload.
    
    res.status(201).json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an artist
// @route   PUT /api/artists/:id
// @access  Private
const updateArtist = async (req, res) => {
  try {
    const { name, username, bio, website, location, specialization, experience, socialLinks } = req.body;
    
    const existingArtist = await prisma.artist.findUnique({
      where: { id: req.params.id }
    });

    if (!existingArtist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    let newProfileImage = undefined;
    if (req.file) {
      const path = require('path');
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        newProfileImage = req.file.path;
      } else {
        newProfileImage = `/uploads/profiles/${path.basename(req.file.path)}`;
      }
      console.log(`[UpdateArtist] File uploaded: ${req.file.originalname} → ${req.file.path}`);
      console.log(`[UpdateArtist] DB path will be: ${newProfileImage}`);
    } else if (req.body.removeImage === 'true') {
      newProfileImage = null;
      console.log(`[UpdateArtist] Image removal requested`);
    }

    const updatedArtist = await prisma.artist.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined && name !== '' ? name : undefined,
        username: username === '' ? null : username !== undefined ? username : undefined,
        bio: bio !== undefined ? bio : undefined,
        website: website === '' ? null : website !== undefined ? website : undefined,
        location: location === '' ? null : location !== undefined ? location : undefined,
        specialization: specialization !== undefined ? specialization : undefined,
        experience: experience === '' ? null : experience !== undefined ? experience : undefined,
        profileImage: newProfileImage !== undefined ? newProfileImage : undefined,
        socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
      }
    });

    let currentProfileImage = null;

    // Keep the User model perfectly in sync with the Artist model updates
    if (newProfileImage !== undefined) {
      await prisma.user.updateMany({
        where: { artistId: updatedArtist.id },
        data: { profileImage: newProfileImage }
      });
      currentProfileImage = newProfileImage;
    } else {
      currentProfileImage = updatedArtist.profileImage || null;
      if (!currentProfileImage) {
        const existingUser = await prisma.user.findFirst({
          where: { artistId: updatedArtist.id },
          select: { profileImage: true }
        });
        currentProfileImage = existingUser?.profileImage || null;
      }
    }

    console.log(`[UpdateArtist] ✅ Saved. Artist.id=${updatedArtist.id} | profileImage=${currentProfileImage}`);

    res.json({
      ...updatedArtist,
      profileImage: currentProfileImage
    });
  } catch (error) {
    console.error('[UpdateArtist] ❌ Error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return res.status(400).json({ message: 'This username is already taken. Please choose another one.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getArtists, getArtistById, createArtist, updateArtist };
