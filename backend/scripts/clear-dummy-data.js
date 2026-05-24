const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing dummy data...');
  
  // Delete all transactional and catalog data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.exhibitionArtwork.deleteMany();
  await prisma.exhibition.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.highlightItem.deleteMany();
  await prisma.highlight.deleteMany();
  await prisma.artwork.deleteMany();
  await prisma.sale.deleteMany();
  
  // Delete all users except the admin (udaychandrabindhani@gmail.com) and maybe udayudaycb23@gmail.com
  // Actually, I'll preserve both emails just in case, or preserve any SUPER_ADMIN.
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'SUPER_ADMIN'
      }
    }
  });

  console.log('All dummy data cleared successfully. Admin user preserved.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
