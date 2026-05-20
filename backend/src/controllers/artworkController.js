const prisma = require('../utils/prismaClient');
const path = require('path');

// @desc    Get all artworks (with filtering, sorting, pagination)
// @route   GET /api/artworks
// @access  Public
const getArtworks = async (req, res) => {
  try {
    const { category, featured, search, sort = 'desc' } = req.query;

    let whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    if (search) {
      whereClause.title = {
        contains: search,
      };
    }

    const artworks = await prisma.artwork.findMany({
      where: whereClause,
      orderBy: {
        createdAt: sort === 'asc' ? 'asc' : 'desc',
      },
      include: {
        artist: {
          select: { id: true, name: true, profileImage: true, user: { select: { profileImage: true } } }
        }
      }
    });

    res.json(artworks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get artwork by ID
// @route   GET /api/artworks/:id
// @access  Public
const getArtworkById = async (req, res) => {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
      include: {
        artist: true,
      },
    });

    if (artwork) {
      res.json(artwork);
    } else {
      res.status(404).json({ message: 'Artwork not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create an artwork
// @route   POST /api/artworks
// @access  Private
const createArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      artworkStory,
      category,
      medium,
      price,
      status,
      yearCreated,
      dimensions,
      featured,
      stock,
      isOriginal,
      artistId,
    } = req.body;

    // The image URL will come from Cloudinary middleware or local disk storage
    let image = '';
    if (req.file) {
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        image = req.file.path;
      } else {
        image = `/uploads/artworks/${path.basename(req.file.path)}`;
      }
    }

    if (!image) {
      return res.status(400).json({ message: 'Artwork image is required' });
    }

    let finalArtistId = artistId;
    if (req.user.role === 'ARTIST') {
      const artistProfile = await prisma.artist.findFirst({
        where: {
          OR: [
            { user: { id: req.user.id } },
            { name: req.user.name }
          ]
        }
      });
      if (!artistProfile) {
        return res.status(400).json({ message: 'No linked artist profile found for your account.' });
      }
      finalArtistId = artistProfile.id;
    }

    if (!finalArtistId) {
      return res.status(400).json({ message: 'Artist assignment is required.' });
    }

    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        artworkStory,
        category,
        medium,
        price: price ? parseFloat(price) : null,
        status: status || 'AVAILABLE',
        yearCreated: parseInt(yearCreated),
        dimensions,
        image,
        featured: featured === 'true',
        stock: stock ? parseInt(stock) : 1,
        isOriginal: isOriginal !== 'false',
        artistId: finalArtistId,
      },
    });

    res.status(201).json(artwork);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an artwork
// @route   PUT /api/artworks/:id
// @access  Private
const updateArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      artworkStory,
      category,
      medium,
      price,
      status,
      yearCreated,
      dimensions,
      featured,
      stock,
      isOriginal,
      artistId,
    } = req.body;

    const existingArtwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
    });

    if (!existingArtwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    let image = existingArtwork.image;
    if (req.file) {
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        image = req.file.path;
      } else {
        image = `/uploads/artworks/${path.basename(req.file.path)}`;
      }
    }

    let finalArtistId = artistId;
    if (req.user.role === 'ARTIST') {
      const artistProfile = await prisma.artist.findFirst({
        where: {
          OR: [
            { user: { id: req.user.id } },
            { name: req.user.name }
          ]
        }
      });
      if (!artistProfile || existingArtwork.artistId !== artistProfile.id) {
        return res.status(403).json({ message: 'You are not authorized to modify this artwork.' });
      }
      finalArtistId = artistProfile.id;
    }

    const updatedArtwork = await prisma.artwork.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        artworkStory,
        category,
        medium,
        price: price ? parseFloat(price) : null,
        status,
        yearCreated: yearCreated ? parseInt(yearCreated) : undefined,
        dimensions,
        image,
        featured: featured === 'true',
        stock: stock ? parseInt(stock) : undefined,
        isOriginal: isOriginal !== undefined ? isOriginal !== 'false' : undefined,
        artistId: finalArtistId,
      },
    });

    res.json(updatedArtwork);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an artwork
// @route   DELETE /api/artworks/:id
// @access  Private (Super Admin)
const deleteArtwork = async (req, res) => {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
    });

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    await prisma.artwork.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Artwork removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
};
