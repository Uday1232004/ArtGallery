const prisma = require('../utils/prismaClient');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        artwork: {
          include: { artist: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle artwork in wishlist (add if absent, remove if present)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { artworkId } = req.body;

    if (!artworkId) {
      return res.status(400).json({ message: 'artworkId is required' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_artworkId: { userId: req.user.id, artworkId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { userId_artworkId: { userId: req.user.id, artworkId } },
      });
      return res.json({ wishlisted: false, message: 'Removed from wishlist' });
    } else {
      await prisma.wishlistItem.create({
        data: { userId: req.user.id, artworkId },
      });
      return res.json({ wishlisted: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check if artwork is in user's wishlist
// @route   GET /api/wishlist/check/:artworkId
// @access  Private
const checkWishlist = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_artworkId: { userId: req.user.id, artworkId } },
    });
    res.json({ wishlisted: !!item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };
