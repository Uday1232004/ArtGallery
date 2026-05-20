require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting avatar migration...');
  
  // 1. Find all artists that have a profileImage
  const artists = await prisma.artist.findMany({
    where: { profileImage: { not: null } }
  });
  
  console.log(`Found ${artists.length} artists with profileImage.`);

  for (const artist of artists) {
    if (artist.profileImage) {
      // 2. Update the corresponding user's avatar field (which will be renamed to profileImage soon)
      const res = await prisma.user.updateMany({
        where: { artistId: artist.id },
        data: { avatar: artist.profileImage }
      });
      console.log(`Migrated image for artist ${artist.name}, users updated: ${res.count}`);
    }
  }

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
