const prisma = require('../utils/prismaClient');
const path = require('path');

// @desc    Get highlights for an artist
// @route   GET /api/highlights/artist/:artistId
// @access  Public
const getHighlights = async (req, res) => {
  try {
    const highlights = await prisma.highlight.findMany({
      where: { artistId: req.params.artistId },
      include: {
        items: true
      },
      orderBy: { order: 'asc' }
    });
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a highlight
// @route   POST /api/highlights
// @access  Private
const createHighlight = async (req, res) => {
  try {
    const { title, artistId, order } = req.body;
    
    let coverImage = '';
    if (req.file) {
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        coverImage = req.file.path;
      } else {
        coverImage = `/uploads/${path.basename(req.file.path)}`;
      }
    }

    const highlight = await prisma.highlight.create({
      data: {
        title,
        artistId,
        order: order ? parseInt(order) : 0,
        coverImage: coverImage || null,
      }
    });
    res.status(201).json(highlight);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a highlight
// @route   PUT /api/highlights/:id
// @access  Private
const updateHighlight = async (req, res) => {
  try {
    const { title, order } = req.body;
    
    const existingHighlight = await prisma.highlight.findUnique({
      where: { id: req.params.id }
    });

    if (!existingHighlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    let coverImage = existingHighlight.coverImage;
    if (req.file) {
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        coverImage = req.file.path;
      } else {
        coverImage = `/uploads/${path.basename(req.file.path)}`;
      }
    }

    const updatedHighlight = await prisma.highlight.update({
      where: { id: req.params.id },
      data: {
        title: title || undefined,
        order: order !== undefined ? parseInt(order) : undefined,
        coverImage
      }
    });

    res.json(updatedHighlight);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a highlight
// @route   DELETE /api/highlights/:id
// @access  Private
const deleteHighlight = async (req, res) => {
  try {
    await prisma.highlight.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Highlight removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add artwork to highlight
// @route   POST /api/highlights/:id/artworks
// @access  Private
const addArtworkToHighlight = async (req, res) => {
  try {
    const { artworkId } = req.body;
    const item = await prisma.highlightItem.create({
      data: {
        highlightId: req.params.id,
        artworkId
      }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove artwork from highlight
// @route   DELETE /api/highlights/items/:itemId
// @access  Private
const removeArtworkFromHighlight = async (req, res) => {
  try {
    await prisma.highlightItem.delete({
      where: { id: req.params.itemId }
    });
    res.json({ message: 'Artwork removed from highlight' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  addArtworkToHighlight,
  removeArtworkFromHighlight
};
