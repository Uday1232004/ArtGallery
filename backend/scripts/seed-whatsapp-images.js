const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding WhatsApp images...');

  // Get the main artist
  const adminUser = await prisma.user.findUnique({
    where: { email: 'udaychandrabindhani@gmail.com' },
    include: { artist: true }
  });

  if (!adminUser || !adminUser.artist) {
    console.error('Error: Admin user or linked artist not found. Please run the main seed.js first.');
    return;
  }
  
  const artistId = adminUser.artist.id;

  const uploadsDir = path.join(__dirname, '../uploads');
  const artworksDir = path.join(uploadsDir, 'artworks');
  
  if (!fs.existsSync(artworksDir)) {
    fs.mkdirSync(artworksDir, { recursive: true });
  }

  // Find all WhatsApp images
  const files = fs.readdirSync(uploadsDir);
  const whatsappImages = files.filter(f => f.startsWith('WhatsApp Image') && (f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png')));

  if (whatsappImages.length === 0) {
    console.log('No WhatsApp images found in the uploads directory.');
    return;
  }

  console.log(`Found ${whatsappImages.length} WhatsApp images. Starting insertion...`);

  let count = 1;
  for (const filename of whatsappImages) {
    const oldPath = path.join(uploadsDir, filename);
    const safeFilename = `uploaded_artwork_${Date.now()}_${count}.jpeg`;
    const newPath = path.join(artworksDir, safeFilename);

    // Move the file into the artworks directory so it's served properly
    fs.copyFileSync(oldPath, newPath);
    
    const artwork = await prisma.artwork.create({
      data: {
        title: `Artwork ${count}`,
        description: 'A beautiful new artwork uploaded to the gallery.',
        category: 'PORTRAIT',
        medium: 'Mixed Media',
        price: 5000 + (count * 100),
        yearCreated: 2026,
        image: `/uploads/artworks/${safeFilename}`,
        featured: true,
        artistId: artistId,
        status: 'AVAILABLE',
        dimensions: '18" x 24"',
        stock: 1,
        isOriginal: true
      }
    });

    console.log(`✅ Added ${filename} as ${artwork.title}`);
    count++;
  }

  console.log('🎉 Successfully seeded all WhatsApp artworks!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
