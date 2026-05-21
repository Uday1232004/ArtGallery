const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const { copySeedAssetSafely } = require('../src/utils/assetHelper');

async function main() {
  console.log('Start seeding...');

  // Check if data already exists — if so, skip seeding to preserve user uploads
  const existingArtworkCount = await prisma.artwork.findFirst();
  if (existingArtworkCount) {
    console.log('✅ Database already has data. Skipping seed to preserve existing content.');
    console.log('   To force re-seed, manually clear the database first.');
    return;
  }
  console.log('📦 Empty database detected. Running initial seed...');

  // ─── 1. Ensure the main admin/artist account exists ───────────────────────
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  let adminUser = await prisma.user.findUnique({
    where: { email: 'udaychandrabindhani@gmail.com' }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'udaychandrabindhani@gmail.com',
        passwordHash,
        name: 'Uday Chandra',
        role: 'SUPER_ADMIN',
        authProvider: 'local',
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  } else {
    // Keep existing Google auth but ensure role is correct
    adminUser = await prisma.user.update({
      where: { email: 'udaychandrabindhani@gmail.com' },
      data: { name: 'Uday Chandra', role: 'SUPER_ADMIN' }
    });
    console.log(`Using existing admin user: ${adminUser.email}`);
  }

  // ─── 2. Create the single Artist Profile linked to the admin account ──────
  const profileImagePath = copySeedAssetSafely('sketch_1.jpeg', 'profiles');

  const artist = await prisma.artist.create({
    data: {
      name: 'Uday Chandra',
      bio: 'Engineering student and self-taught artist exploring the intersection of emotion, logic, and visual storytelling.',
      specialization: 'Pencil realistic portraits, Pen art, Krishna artworks',
      experience: 'Self-taught, 10+ years sketching',
      profileImage: adminUser.profileImage || profileImagePath,
      socialLinks: {
        instagram: 'https://instagram.com/_art__bro_/',
        behance: 'https://behance.net/udaychandra'
      }
    }
  });

  // Link artist to the admin user
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { artistId: artist.id }
  });
  console.log(`Created and linked artist profile: ${artist.name}`);

  // ─── 3. Create All 12 Artworks ────────────────────────────────────────────
  const artworksData = [
    {
      title: 'The Gaze',
      description: 'An exploration of silence, focus, and quiet intensity. "The Gaze" is a detailed study of eyes that have witnessed both structure and creation. Drawn entirely with fine-grade graphite, this piece spent over 60 hours in development to capture the micro-textures of skin and the warm, cinematic reflection in the iris.',
      category: 'PORTRAIT',
      medium: 'Graphite on Paper',
      price: 850,
      yearCreated: 2025,
      image: copySeedAssetSafely('sketch_1.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '18" x 24"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Divine Flute',
      description: 'Capturing the celestial and serene presence of Krishna. High-contrast charcoal creates deep, velvety shadows, while delicate details represent the divine light radiating from within.',
      category: 'KRISHNA_ART',
      medium: 'Charcoal on Paper',
      price: 1200,
      yearCreated: 2026,
      image: copySeedAssetSafely('sketch_2.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '16" x 20"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Fractured',
      description: 'A visual translation of the analytical engineering brain colliding with the chaotic flow of pure expression. Combining ink washes, scrapings, and fine pencil lines.',
      category: 'EXPERIMENTAL',
      medium: 'Mixed Media',
      price: 600,
      yearCreated: 2025,
      image: copySeedAssetSafely('sketch_3.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '12" x 12"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Old Soul',
      description: 'A tribute to the layers of history, wisdom, and life stories written in the lines of an elderly face. This hyper-realistic drawing pushes the boundaries of texture replication.',
      category: 'PORTRAIT',
      medium: 'Pencil Sketch',
      price: 750,
      yearCreated: 2024,
      image: copySeedAssetSafely('sketch_4.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '14" x 18"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Ink Flow I',
      description: 'An intricate map of geometric flows and fine detailing. Created entirely with a 0.05mm technical drawing pen.',
      category: 'PEN_ART',
      medium: 'Fineliner',
      price: 450,
      yearCreated: 2025,
      image: copySeedAssetSafely('sketch_5.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '10" x 14"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Radha Krishna',
      description: 'A representation of eternal love and spiritual connection. Drawn with a rich spectrum of graphite grades from 2H to 10B.',
      category: 'KRISHNA_ART',
      medium: 'Graphite',
      price: 1500,
      yearCreated: 2026,
      image: copySeedAssetSafely('sketch_6.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '20" x 30"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Micro Details',
      description: 'Pushing the limits of fine-line pen work. Exploring micro-textures and shading through cross-hatching and stippling techniques.',
      category: 'PEN_ART',
      medium: 'Micron Pen',
      price: 550,
      yearCreated: 2025,
      image: copySeedAssetSafely('sketch_7.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '12" x 16"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Emotion State',
      description: 'Capturing abstract sorrow and inner beauty. Applying dynamic charcoal washes on wet heavy-duty art paper.',
      category: 'EXPERIMENTAL',
      medium: 'Charcoal Wash',
      price: 950,
      yearCreated: 2025,
      image: copySeedAssetSafely('sketch_8.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '18" x 24"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Brother',
      description: 'A study of boyhood, trust, and growing up. Drawn from life, focusing on realistic hair textures and soft shadow values.',
      category: 'PORTRAIT',
      medium: 'Pencil',
      price: 800,
      yearCreated: 2024,
      image: copySeedAssetSafely('sketch_9.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '16" x 20"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Serenity',
      description: 'A serene portrait of Lord Krishna, capturing peaceful divine contemplation with fine-line shading and soft pencil blending.',
      category: 'KRISHNA_ART',
      medium: 'Pencil Sketch',
      price: 1100,
      yearCreated: 2026,
      image: copySeedAssetSafely('sketch_10.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '16" x 20"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Silent Whispers',
      description: 'A delicate study of shadow and light on face contours, showcasing the beauty of charcoal pencil blending and portrait realism.',
      category: 'PORTRAIT',
      medium: 'Charcoal on Paper',
      price: 900,
      yearCreated: 2025,
      image: copySeedAssetSafely('sketch_11.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '14" x 18"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Flowing Thoughts',
      description: 'A complex web of geometric ink patterns and organic stippling, exploring microscopic visual elements and fine pen execution.',
      category: 'PEN_ART',
      medium: 'Fineliner',
      price: 650,
      yearCreated: 2026,
      image: copySeedAssetSafely('sketch_12.jpeg', 'artworks'),
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '12" x 16"',
      stock: 1,
      isOriginal: true
    }
  ];

  for (const aw of artworksData) {
    const artwork = await prisma.artwork.create({ data: aw });
    console.log(`Created artwork: ${artwork.title}`);
  }

  // ─── 4. Create Exhibition ─────────────────────────────────────────────────
  const exhibitionBannerPath = copySeedAssetSafely('sketch_3.jpeg', 'exhibitions');

  const exhibition = await prisma.exhibition.create({
    data: {
      name: 'Shadows & Light: Solo Exhibition',
      theme: 'Exploring human emotion through monochromatic mediums',
      description: 'A month-long showcase featuring new graphite portraits and pen art experiments.',
      startDate: new Date('2024-06-01T00:00:00Z'),
      endDate: new Date('2024-06-30T23:59:59Z'),
      location: 'Virtual Gallery',
      bannerImage: exhibitionBannerPath
    }
  });

  const allArtworks = await prisma.artwork.findMany();
  for (const aw of allArtworks) {
    await prisma.exhibitionArtwork.create({
      data: { exhibitionId: exhibition.id, artworkId: aw.id }
    });
  }
  console.log(`Created exhibition: ${exhibition.name}`);

  // ─── 5. Sample Commission ─────────────────────────────────────────────────
  await prisma.commission.create({
    data: {
      clientName: 'Sarah Jenkins',
      email: 'sarah@example.com',
      phone: '+1 555-9876',
      artworkType: 'Realistic Portrait',
      budget: '$500',
      message: 'I would like a pencil portrait of my grandfather based on the attached reference photo.',
      status: 'PENDING',
      shippingAddress: '789 Portrait Lane',
      shippingCity: 'Collector Valley',
      shippingPincode: '98765',
      advanceAmount: 100.0,
      paymentStatus: 'PAID',
      artistId: artist.id
    }
  });
  console.log('Created sample commission request');

  console.log('\n✅ Seeding finished.');
  console.log(`   Account : udaychandrabindhani@gmail.com`);
  console.log(`   Role    : SUPER_ADMIN`);
  console.log(`   Artworks: ${allArtworks.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
