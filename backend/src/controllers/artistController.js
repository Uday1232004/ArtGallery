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
            email: true
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
            email: true
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

    let profileImage = existingArtist.profileImage;
    if (req.file) {
      const path = require('path');
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        profileImage = req.file.path;
      } else {
        profileImage = `/uploads/profiles/${path.basename(req.file.path)}`;
      }
      console.log(`[UpdateArtist] File uploaded: ${req.file.originalname} → ${req.file.path}`);
      console.log(`[UpdateArtist] DB path will be: ${profileImage}`);
    } else if (req.body.removeImage === 'true') {
      profileImage = null;
      console.log(`[UpdateArtist] Image removal requested`);
    }

    const updatedArtist = await prisma.artist.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        username: username !== undefined ? username : undefined,
        bio: bio !== undefined ? bio : undefined,
        website: website !== undefined ? website : undefined,
        location: location !== undefined ? location : undefined,
        specialization: specialization !== undefined ? specialization : undefined,
        experience: experience !== undefined ? experience : undefined,
        profileImage,
        socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
      }
    });

    console.log(`[UpdateArtist] ✅ Saved. Artist.id=${updatedArtist.id} | profileImage=${updatedArtist.profileImage}`);

    res.json(updatedArtist);
  } catch (error) {
    console.error('[UpdateArtist] ❌ Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getArtists, getArtistById, createArtist, updateArtist };
