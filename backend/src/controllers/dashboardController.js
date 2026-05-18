const prisma = require('../utils/prismaClient');

const getAnalytics = async (req, res) => {
  try {
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
