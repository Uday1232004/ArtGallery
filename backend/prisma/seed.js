const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data
  await prisma.sale.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.exhibitionArtwork.deleteMany()
  await prisma.exhibition.deleteMany()
  await prisma.artwork.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Super Admin User
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash('admin123', salt)

  const admin = await prisma.user.create({
    data: {
      email: 'udaychandrabindhani@gmail.com',
      passwordHash,
      name: 'Uday Chandra (Admin)',
      role: 'SUPER_ADMIN',
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // 2. Create the main Artist Profile
  const artist = await prisma.artist.create({
    data: {
      name: 'Uday Chandra',
      bio: 'Engineering student and self-taught artist exploring the intersection of emotion, logic, and visual storytelling.',
      specialization: 'Pencil realistic portraits, Pen art, Krishna artworks',
      experience: 'Self-taught, 10+ years sketching',
      socialLinks: {
        instagram: 'https://instagram.com/udaychandra',
        behance: 'https://behance.net/udaychandra'
      }
    }
  })
  console.log(`Created artist: ${artist.name}`)

  // 3. Create All 9 Public Artworks
  const artworksData = [
    {
      title: 'The Gaze',
      description: 'An exploration of silence, focus, and quiet intensity. "The Gaze" is a detailed study of eyes that have witnessed both structure and creation. Drawn entirely with fine-grade graphite, this piece spent over 60 hours in development to capture the micro-textures of skin and the warm, cinematic reflection in the iris.',
      category: 'PORTRAIT',
      medium: 'Graphite on Paper',
      price: 850,
      yearCreated: 2025,
      image: 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '18" x 24"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Divine Flute',
      description: 'Capturing the celestial and serene presence of Krishna. High-contrast charcoal creates deep, velvety shadows, while delicate 24k gold leaf details represent the divine light radiating from within. An atmospheric, emotional masterpiece designed to bring peace and deep spirituality.',
      category: 'KRISHNA_ART',
      medium: 'Charcoal & Gold Leaf',
      price: 1200,
      yearCreated: 2026,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '16" x 20"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Fractured',
      description: 'A visual translation of the analytical engineering brain colliding with the chaotic flow of pure expression. Combining ink washes, scrapings, and fine pencil lines, "Fractured" represents the moment logic breaks down and reveals the raw emotion underneath.',
      category: 'EXPERIMENTAL',
      medium: 'Mixed Media',
      price: 600,
      yearCreated: 2025,
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '12" x 12"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Old Soul',
      description: 'A tribute to the layers of history, wisdom, and life stories written in the lines of an elderly face. This hyper-realistic drawing pushes the boundaries of texture replication using charcoal, graphite, and blending stumps to breathe authentic life into paper.',
      category: 'PORTRAIT',
      medium: 'Pencil Sketch',
      price: 750,
      yearCreated: 2024,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '14" x 18"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Ink Flow I',
      description: 'An intricate map of geometric flows and fine detailing. Created entirely with a 0.05mm technical drawing pen, this piece captures the natural patterns found in tree rings, river currents, and neural maps, demonstrating meticulous precision.',
      category: 'PEN_ART',
      medium: 'Fineliner',
      price: 450,
      yearCreated: 2025,
      image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '10" x 14"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Radha Krishna',
      description: 'A representation of eternal love and spiritual connection. Drawn with a rich spectrum of graphite grades from 2H to 10B to construct extreme contrast and deep dimensionality. Captures a calm, serene moment of companionship between Radha and Krishna.',
      category: 'KRISHNA_ART',
      medium: 'Graphite',
      price: 1500,
      yearCreated: 2026,
      image: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '20" x 30"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Micro Details',
      description: 'Pushing the limits of fine-line pen work. Exploring micro-textures and shading through cross-hatching and stippling techniques. A highly organic study reflecting thousands of individual pen strokes.',
      category: 'PEN_ART',
      medium: 'Micron Pen',
      price: 550,
      yearCreated: 2025,
      image: 'https://images.unsplash.com/photo-1583344665471-bd1f52d5b6e2?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '12" x 16"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Emotion State',
      description: 'Capturing abstract sorrow and inner beauty. Applying dynamic charcoal washes on wet heavy-duty art paper to generate fluid, smoky edges that mimic the atmospheric cinematography of classic emotional films.',
      category: 'EXPERIMENTAL',
      medium: 'Charcoal Wash',
      price: 950,
      yearCreated: 2025,
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE',
      dimensions: '18" x 24"',
      stock: 1,
      isOriginal: true
    },
    {
      title: 'Brother',
      description: 'A study of boyhood, trust, and growing up. Drawn from life, focusing on realistic hair textures and soft shadow values to invoke nostalgia and close emotional warmth.',
      category: 'PORTRAIT',
      medium: 'Pencil',
      price: 800,
      yearCreated: 2024,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'SOLD',
      dimensions: '16" x 20"',
      stock: 1,
      isOriginal: true
    }
  ]

  for (const aw of artworksData) {
    const artwork = await prisma.artwork.create({ data: aw })
    console.log(`Created artwork: ${artwork.title}`)
  }

  // 4. Create an Exhibition
  const exhibition = await prisma.exhibition.create({
    data: {
      name: 'Shadows & Light: Solo Exhibition',
      theme: 'Exploring human emotion through monochromatic mediums',
      description: 'A month-long showcase featuring new graphite portraits and pen art experiments.',
      startDate: new Date('2024-06-01T00:00:00Z'),
      endDate: new Date('2024-06-30T23:59:59Z'),
      location: 'Virtual Gallery',
      bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80'
    }
  })
  
  // Link artworks to exhibition
  const allArtworks = await prisma.artwork.findMany()
  for (const aw of allArtworks) {
    await prisma.exhibitionArtwork.create({
      data: {
        exhibitionId: exhibition.id,
        artworkId: aw.id
      }
    })
  }
  console.log(`Created exhibition: ${exhibition.name}`)

  // 5. Create a Sample Commission Request
  await prisma.commission.create({
    data: {
      clientName: 'Sarah Jenkins',
      email: 'sarah@example.com',
      artworkType: 'Realistic Portrait',
      budget: '$500',
      message: 'I would like a pencil portrait of my grandfather based on the attached reference photo.',
      status: 'PENDING'
    }
  })
  console.log(`Created sample commission request`)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
