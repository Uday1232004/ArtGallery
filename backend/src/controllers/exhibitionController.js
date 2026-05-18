const prisma = require('../utils/prismaClient');

// @desc    Get all exhibitions
// @route   GET /api/exhibitions
// @access  Public
const getExhibitions = async (req, res) => {
  try {
    const exhibitions = await prisma.exhibition.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        artworks: {
          include: {
            artwork: true
          }
        }
      }
    });
    res.json(exhibitions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get exhibition by ID
// @route   GET /api/exhibitions/:id
// @access  Public
const getExhibitionById = async (req, res) => {
  try {
    const exhibition = await prisma.exhibition.findUnique({
      where: { id: req.params.id },
      include: {
        artworks: {
          include: {
            artwork: true
          }
        }
      }
    });
    if (exhibition) {
      res.json(exhibition);
    } else {
      res.status(404).json({ message: 'Exhibition not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createExhibition = async (req, res) => {
  try {
    const { name, theme, description, startDate, endDate, location, artworkIds } = req.body;
    
    let bannerImage = '';
    if (req.file) {
      const path = require('path');
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        bannerImage = req.file.path;
      } else {
        bannerImage = `/uploads/${path.basename(req.file.path)}`;
      }
    }

    const exhibition = await prisma.exhibition.create({
      data: {
        name,
        theme,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        bannerImage: bannerImage || null,
      }
    });

    if (artworkIds) {
      const ids = JSON.parse(artworkIds);
      if (ids.length > 0) {
        const links = ids.map(artId => ({
          artworkId: artId,
          exhibitionId: exhibition.id
        }));
        await prisma.exhibitionArtwork.createMany({
          data: links
        });
      }
    }

    res.status(201).json(exhibition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateExhibition = async (req, res) => {
  try {
    const { name, theme, description, startDate, endDate, location, artworkIds } = req.body;

    const existingExh = await prisma.exhibition.findUnique({
      where: { id: req.params.id }
    });

    if (!existingExh) {
      return res.status(404).json({ message: 'Exhibition not found' });
    }

    let bannerImage = existingExh.bannerImage;
    if (req.file) {
      const path = require('path');
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        bannerImage = req.file.path;
      } else {
        bannerImage = `/uploads/${path.basename(req.file.path)}`;
      }
    }

    const updatedExh = await prisma.exhibition.update({
      where: { id: req.params.id },
      data: {
        name,
        theme,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        bannerImage,
      }
    });

    if (artworkIds) {
      const ids = JSON.parse(artworkIds);
      // Clean old links first
      await prisma.exhibitionArtwork.deleteMany({
        where: { exhibitionId: req.params.id }
      });
      // Insert new links
      if (ids.length > 0) {
        const links = ids.map(artId => ({
          artworkId: artId,
          exhibitionId: req.params.id
        }));
        await prisma.exhibitionArtwork.createMany({
          data: links
        });
      }
    }

    res.json(updatedExh);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteExhibition = async (req, res) => {
  try {
    const existingExh = await prisma.exhibition.findUnique({
      where: { id: req.params.id }
    });

    if (!existingExh) {
      return res.status(404).json({ message: 'Exhibition not found' });
    }

    await prisma.exhibition.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Exhibition removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getExhibitions, getExhibitionById, createExhibition, updateExhibition, deleteExhibition };
