const prisma = require('../utils/prismaClient');

const getAnalytics = async (req, res) => {
  try {
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
        return res.json({
          totalArtworks: 0,
          soldArtworks: 0,
          activeExhibitions: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
          recentCommissions: [],
          recentOrders: [],
        });
      }

      const [
        totalArtworks,
        soldArtworks,
        activeExhibitions,
        totalOrders,
        uniqueCollectorsCount,
        recentOrdersRaw,
        soldItems,
      ] = await Promise.all([
        prisma.artwork.count({ where: { artistId: artistProfile.id } }),
        prisma.artwork.count({ where: { artistId: artistProfile.id, status: 'SOLD' } }),
        prisma.exhibition.count({
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            artworks: { some: { artwork: { artistId: artistProfile.id } } },
          },
        }),
        prisma.order.count({
          where: { items: { some: { artwork: { artistId: artistProfile.id } } } },
        }),
        prisma.user.count({
          where: {
            orders: { some: { items: { some: { artwork: { artistId: artistProfile.id } } } } },
          },
        }),
        prisma.order.findMany({
          where: { items: { some: { artwork: { artistId: artistProfile.id } } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true, email: true } },
            items: { include: { artwork: { select: { title: true, image: true, artistId: true } } } },
          },
        }),
        prisma.orderItem.findMany({
          where: {
            artwork: { artistId: artistProfile.id },
            order: { status: { not: 'CANCELLED' } },
          },
          select: { price: true, quantity: true },
        }),
      ]);

      const totalRevenue = soldItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Filter other artists' items out of recentOrders and calculate their totals
      const recentOrders = recentOrdersRaw.map(order => {
        const artistItems = order.items.filter(item => item.artwork.artistId === artistProfile.id);
        const artistTotal = artistItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
          ...order,
          items: artistItems,
          total: artistTotal
        };
      });

      return res.json({
        totalArtworks,
        soldArtworks,
        activeExhibitions,
        totalOrders,
        totalUsers: uniqueCollectorsCount,
        totalRevenue,
        recentCommissions: [],
        recentOrders,
      });
    }

    // Default logic for SUPER_ADMIN and MANAGER
    const [
      totalArtworks,
      soldArtworks,
      activeExhibitions,
      totalOrders,
      totalUsers,
      recentCommissions,
      recentOrders,
      orderRevenue,
    ] = await Promise.all([
      prisma.artwork.count(),
      prisma.artwork.count({ where: { status: 'SOLD' } }),
      prisma.exhibition.count({
        where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.commission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { artwork: { select: { title: true, image: true } } } },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    res.json({
      totalArtworks,
      soldArtworks,
      activeExhibitions,
      totalOrders,
      totalUsers,
      totalRevenue: orderRevenue._sum.total || 0,
      recentCommissions,
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getAnalytics };
