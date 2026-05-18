const prisma = require('../utils/prismaClient');

// @desc    Get cart for logged-in user
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        artwork: {
          include: { artist: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = items.reduce((sum, item) => sum + (item.artwork.price || 0) * item.quantity, 0);

    res.json({ items, total, count: items.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add artwork to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { artworkId, quantity = 1 } = req.body;

    if (!artworkId) {
      return res.status(400).json({ message: 'artworkId is required' });
    }

    const artwork = await prisma.artwork.findUnique({ where: { id: artworkId } });
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    if (artwork.status === 'SOLD' || artwork.stock < 1) {
      return res.status(400).json({ message: 'This artwork is no longer available' });
    }

    // Upsert: create or increment quantity
    const cartItem = await prisma.cartItem.upsert({
      where: { userId_artworkId: { userId: req.user.id, artworkId } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.id, artworkId, quantity },
      include: {
        artwork: { include: { artist: { select: { name: true } } } },
      },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:artworkId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { artworkId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const item = await prisma.cartItem.update({
      where: { userId_artworkId: { userId: req.user.id, artworkId } },
      data: { quantity },
      include: { artwork: { include: { artist: { select: { name: true } } } } },
    });

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:artworkId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { artworkId } = req.params;

    await prisma.cartItem.delete({
      where: { userId_artworkId: { userId: req.user.id, artworkId } },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
