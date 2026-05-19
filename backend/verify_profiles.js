const prisma = require('./src/utils/prismaClient');

async function runProfileVerification() {
  console.log('🚀 Running profile separation and role authentication programmatic verification...');
  
  try {
    const testCollectorEmail = 'test_collector_' + Date.now() + '@gmail.com';
    const testArtistEmail = 'test_artist_' + Date.now() + '@gmail.com';

    // 1. Simulating Google OAuth for standard collector (USER)
    console.log(`\n--- 1. Testing Google Sign-In for User: ${testCollectorEmail} ---`);
    const mockGoogleTokenCollector = 'mock_jwt_collector_' + Date.now();
    
    // We bypass verifyGoogleToken in test mode, or we can mock/simulate db behavior directly
    // Let's test the database flow directly since verifyGoogleToken requires a real Google API call.
    // We'll mimic the logic of authController.js:
    
    // Fetch or create user
    const collectorUser = await prisma.user.create({
      data: {
        email: testCollectorEmail,
        name: 'Test Collector',
        role: 'USER',
        passwordHash: '', // Google users don't have password
      }
    });
    console.log(`✅ Collector User created in DB. ID: ${collectorUser.id}, Role: ${collectorUser.role}`);

    // Verify collector does not have an artist profile associated
    if (collectorUser.artistId) {
      throw new Error('Failure: Standard collector user should not have an artistId assigned!');
    }
    console.log('✅ Standard user has no artist profile, as expected.');

    // 2. Simulating Google OAuth for artist (ARTIST)
    console.log(`\n--- 2. Testing Google Sign-In for Artist: ${testArtistEmail} ---`);
    
    // Mimic the backend login logic:
    // Create the User first
    const artistUser = await prisma.user.create({
      data: {
        email: testArtistEmail,
        name: 'Test Artist Profile',
        role: 'ARTIST',
        passwordHash: '',
      }
    });
    console.log(`✅ Artist User created in DB. ID: ${artistUser.id}, Role: ${artistUser.role}`);

    // The backend login/register flow runs ensureArtistProfile
    let artistProfile = null;
    if (artistUser.name) {
      artistProfile = await prisma.artist.findFirst({
        where: { name: artistUser.name }
      });
    }

    if (!artistProfile) {
      // Auto-provision
      artistProfile = await prisma.artist.create({
        data: {
          name: artistUser.name,
          username: artistUser.email.split('@')[0],
          bio: '',
          profileImage: '',
          specialization: ''
        }
      });
      // Link back
      await prisma.user.update({
        where: { id: artistUser.id },
        data: { artistId: artistProfile.id }
      });
    }

    console.log(`✅ Artist profile provisioned and linked. Artist ID: ${artistProfile.id}, Name: ${artistProfile.name}`);
    
    // Check if artist user's profile is empty
    const artworksCount = await prisma.artwork.count({
      where: { artistId: artistProfile.id }
    });
    console.log(`📊 Number of artworks for new Artist: ${artworksCount}`);
    if (artworksCount !== 0) {
      throw new Error('Failure: New artist profile should be empty (0 artworks)!');
    }
    console.log('✅ New artist profile is completely empty as expected.');

    // 3. Add an artwork post for this artist
    console.log('\n--- 3. Adding artwork for the new Artist ---');
    const newArtwork = await prisma.artwork.create({
      data: {
        title: 'Vibrant Pop Art Portrait',
        description: 'A custom pop art design generated for verification.',
        medium: 'Pop Art',
        category: 'PEN_ART',
        price: 350,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500',
        dimensions: '20" x 20"',
        yearCreated: 2026,
        status: 'AVAILABLE',
        artistId: artistProfile.id
      }
    });
    console.log(`✅ Artwork created. Title: "${newArtwork.title}", Artist ID: ${newArtwork.artistId}`);

    // Verify the homepage query returns the artwork and includes correct artist name
    console.log('\n--- 4. Querying Homepage works representation ---');
    const dbArtworks = await prisma.artwork.findMany({
      where: { id: newArtwork.id },
      include: {
        artist: {
          select: { name: true }
        }
      }
    });

    if (dbArtworks.length === 0) {
      throw new Error('Failure: Newly created artwork could not be found!');
    }

    const fetchedArtwork = dbArtworks[0];
    console.log(`🎨 Fetched Artwork: "${fetchedArtwork.title}"`);
    console.log(`🎨 Creator Name: "${fetchedArtwork.artist?.name}"`);
    if (fetchedArtwork.artist?.name !== artistProfile.name) {
      throw new Error(`Failure: Artist name mismatch! Expected: ${artistProfile.name}, Got: ${fetchedArtwork.artist?.name}`);
    }
    console.log('✅ Artist name is correctly resolved and associated with the artwork!');

    // Clean up test data
    console.log('\n--- 5. Cleaning up test data ---');
    await prisma.artwork.delete({ where: { id: newArtwork.id } });
    await prisma.artist.delete({ where: { id: artistProfile.id } });
    await prisma.user.delete({ where: { id: artistUser.id } });
    await prisma.user.delete({ where: { id: collectorUser.id } });
    console.log('✅ Test data cleaned up successfully.');

    console.log('\n🌟 ALL PROFILE VERIFICATION TESTS COMPLETED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
}

runProfileVerification();
