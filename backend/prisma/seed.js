const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data (optional, careful in prod!)
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
      email: 'admin@udaychandra.com',
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

  // 3. Create Sample Artworks
  const artworksData = [
    {
      title: 'The Gaze',
      description: 'A deeply emotional portrait focusing on the eyes.',
      category: 'PORTRAIT',
      medium: 'Graphite on Paper',
      price: 250,
      yearCreated: 2024,
      image: 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE'
    },
    {
      title: 'Divine Flute',
      description: 'Krishna playing the flute, a study in devotion.',
      category: 'KRISHNA_ART',
      medium: 'Charcoal & Gold Leaf',
      price: 400,
      yearCreated: 2023,
      image: 'https://images.unsplash.com/photo-1590059528919-6192db87d7b2?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE'
    },
    {
      title: 'Ink Flow I',
      description: 'An experimental piece done entirely with micron pens.',
      category: 'PEN_ART',
      medium: 'Fineliner',
      price: 150,
      yearCreated: 2024,
      image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&q=80',
      featured: false,
      artistId: artist.id,
      status: 'SOLD'
    },
    {
      title: 'Fractured Reality',
      description: 'Mixed media exploration of memory.',
      category: 'EXPERIMENTAL',
      medium: 'Mixed Media',
      price: 300,
      yearCreated: 2023,
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
      featured: true,
      artistId: artist.id,
      status: 'AVAILABLE'
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
