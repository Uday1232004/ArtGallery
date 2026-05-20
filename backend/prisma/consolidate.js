const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔮 Starting Artist Profile Consolidation...');

  // 1. Find the target primary artist profile (linked to udaychandrabindhani@gmail.com)
  const primaryUser = await prisma.user.findUnique({
    where: { email: 'udaychandrabindhani@gmail.com' },
    include: { artist: true }
  });

  if (!primaryUser) {
    console.error('❌ Could not find user with email: udaychandrabindhani@gmail.com');
    return;
  }

  let primaryArtist = primaryUser.artist;
  if (!primaryArtist) {
    console.log('⚠️ Primary user has no linked artist profile yet. Creating one...');
    primaryArtist = await prisma.artist.create({
      data: {
        name: 'Uday Chandra',
        bio: 'Engineering student and self-taught artist exploring the intersection of emotion, logic, and visual storytelling.',
        specialization: 'Pencil realistic portraits, Pen art, Krishna artworks',
        experience: 'Self-taught, 10+ years sketching',
        profileImage: '/uploads/profileImage-1779207460662-736920481.jpg',
        socialLinks: {
          instagram: 'https://instagram.com/_art__bro_/',
          behance: 'https://behance.net/udaychandra'
        }
      }
    });

    await prisma.user.update({
      where: { id: primaryUser.id },
      data: { artistId: primaryArtist.id }
    });
    console.log(`✅ Created and linked primary artist profile: ${primaryArtist.name}`);
  } else {
    // Update it with premium seed info if it was blank
    primaryArtist = await prisma.artist.update({
      where: { id: primaryArtist.id },
      data: {
        name: 'Uday Chandra',
        bio: 'Engineering student and self-taught artist exploring the intersection of emotion, logic, and visual storytelling.',
        specialization: 'Pencil realistic portraits, Pen art, Krishna artworks',
        experience: 'Self-taught, 10+ years sketching',
        profileImage: '/uploads/profileImage-1779207460662-736920481.jpg',
        socialLinks: {
          instagram: 'https://instagram.com/_art__bro_/',
          behance: 'https://behance.net/udaychandra'
        }
      }
    });
    console.log(`✅ Updated existing primary artist profile info for: ${primaryArtist.name}`);
  }

  // 2. Find other profiles to consolidate from
  const otherArtists = await prisma.artist.findMany({
    where: {
      id: { not: primaryArtist.id }
    }
  });

  console.log(`Found ${otherArtists.length} other artist profiles in database.`);

  // 3. Move all artworks to the primary profile
  for (const other of otherArtists) {
    const artworks = await prisma.artwork.findMany({
      where: { artistId: other.id }
    });

    if (artworks.length > 0) {
      console.log(`📦 Moving ${artworks.length} artworks from artist profile "${other.name}" (ID: ${other.id}) to primary profile...`);
      
      const updateResult = await prisma.artwork.updateMany({
        where: { artistId: other.id },
        data: { artistId: primaryArtist.id }
      });
      
      console.log(`  └─ Successfully moved ${updateResult.count} artworks.`);
    }

    // Move commissions too
    const commissions = await prisma.commission.findMany({
      where: { artistId: other.id }
    });

    if (commissions.length > 0) {
      console.log(`📝 Moving ${commissions.length} commissions from artist profile "${other.name}" to primary...`);
      await prisma.commission.updateMany({
        where: { artistId: other.id },
        data: { artistId: primaryArtist.id }
      });
    }
  }

  console.log('\n🎉 Consolidation completed successfully!');
  
  // Print final status
  const finalArtworks = await prisma.artwork.findMany({
    where: { artistId: primaryArtist.id }
  });
  console.log(`⭐️ Primary Artist "${primaryArtist.name}" now owns ${finalArtworks.length} artworks!`);
  finalArtworks.forEach(a => console.log(`  - [${a.status}] ${a.title}`));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
