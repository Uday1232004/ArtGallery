const prisma = require('../utils/prismaClient');

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private (USER)
const createOrder = async (req, res) => {
  try {
    const {
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPincode,
      notes,
      paymentMethod,
      paymentStatus,
    } = req.body;

    if (!shippingName || !shippingEmail || !shippingAddress || !shippingCity || !shippingPincode) {
      return res.status(400).json({ message: 'Shipping details are required' });
    }

    // Fetch user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { artwork: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Verify all artworks still available
    for (const item of cartItems) {
      if (item.artwork.status === 'SOLD' || item.artwork.stock < item.quantity) {
        return res.status(400).json({
          message: `"${item.artwork.title}" is no longer available in the requested quantity`,
        });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + (item.artwork.price || 0) * item.quantity, 0);

    // Create order + items in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          shippingName,
          shippingEmail,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingPincode,
          notes,
          paymentMethod: paymentMethod || 'COD',
          paymentStatus: paymentStatus || 'PENDING',
          items: {
            create: cartItems.map((item) => ({
              artworkId: item.artworkId,
              quantity: item.quantity,
              price: item.artwork.price || 0,
            })),
          },
        },
        include: { items: { include: { artwork: true } } },
      });

      // Update stock and status for each artwork
      for (const item of cartItems) {
        const newStock = item.artwork.stock - item.quantity;
        await tx.artwork.update({
          where: { id: item.artworkId },
          data: {
            stock: newStock,
            status: newStock <= 0 ? 'SOLD' : 'AVAILABLE',
          },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private (USER)
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            artwork: {
              select: { id: true, title: true, image: true, medium: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            artwork: {
              include: { artist: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Users can only see their own orders; admins/artists see all (or their filtered portion)
    if (order.userId !== req.user.id && req.user.role === 'USER') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'ARTIST') {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { artistId: true, name: true }
      });
      let artistProfile = null;
      if (dbUser) {
        artistProfile = await prisma.artist.findFirst({
          where: {
            OR: [
              { id: dbUser.artistId || '' },
              { name: dbUser.name }
            ]
          }
        });
      }

      if (!artistProfile) {
        return res.status(403).json({ message: 'Not authorized: no linked artist profile' });
      }

      // Check if order contains this artist's artworks
      const hasArtistArtwork = order.items.some(item => item.artwork.artistId === artistProfile.id);
      if (!hasArtistArtwork) {
        return res.status(403).json({ message: 'Not authorized: this order does not contain your artwork' });
      }

      // Filter order items to only show this artist's artworks
      order.items = order.items.filter(item => item.artwork.artistId === artistProfile.id);
      order.total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private (ADMIN)
const getAllOrders = async (req, res) => {
  try {
    let whereClause = {};
    let artistProfile = null;

    if (req.user.role === 'ARTIST') {
      // Find the artist profile linked to this user
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { artistId: true, name: true }
      });

      if (dbUser) {
        artistProfile = await prisma.artist.findFirst({
          where: {
            OR: [
              { id: dbUser.artistId || '' },
              { name: dbUser.name }
            ]
          }
        });
      }

      if (artistProfile) {
        whereClause = {
          items: {
            some: {
              artwork: {
                artistId: artistProfile.id
              }
            }
          }
        };
      } else {
        // If no artist profile is found, return empty array
        return res.json([]);
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            artwork: { select: { id: true, title: true, image: true, artistId: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If the logged-in user is an ARTIST, filter each order's items to only show their artworks
    if (req.user.role === 'ARTIST' && artistProfile) {
      const filteredOrders = orders.map(order => {
        const artistItems = order.items.filter(item => item.artwork.artistId === artistProfile.id);
        const artistTotal = artistItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        return {
          ...order,
          items: artistItems,
          total: artistTotal
        };
      });

      return res.json(filteredOrders);
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private (ADMIN)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { artwork: { select: { title: true } } } },
      },
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/orders/users
// @access  Private (ADMIN)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getAllUsers };
