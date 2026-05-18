const prisma = require('../utils/prismaClient');

// @desc    Add a review to an artwork (must have purchased it)
// @route   POST /api/reviews
// @access  Private (USER)
const addReview = async (req, res) => {
  try {
    const { artworkId, rating, comment } = req.body;

    if (!artworkId || !rating || !comment) {
      return res.status(400).json({ message: 'artworkId, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has purchased this artwork
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        artworkId,
        order: { userId: req.user.id, status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      },
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review artworks you have purchased' });
    }

    // Upsert review (one per user per artwork)
    const review = await prisma.review.upsert({
      where: { userId_artworkId: { userId: req.user.id, artworkId } },
      update: { rating, comment },
      create: { userId: req.user.id, artworkId, rating, comment },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reviews for an artwork
// @route   GET /api/reviews/:artworkId
// @access  Public
const getArtworkReviews = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { artworkId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      reviews,
      totalReviews: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { addReview, getArtworkReviews };
