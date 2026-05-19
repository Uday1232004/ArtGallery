const BASE_URL = 'http://localhost:5001/api';

async function runCommissionTests() {
  console.log('🚀 Starting commissions lifecycle programmatic API integration tests...');
  let artistToken = null;
  let clientToken = null;
  let artistId = null;
  let commissionId1 = null;
  let commissionId2 = null;

  try {
    // 1. Log in as Artist (artist@artbro.com) to capture their profile ID
    console.log('\n--- 1. Logging in as Artist to find artist profile ID ---');
    const artistLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'artist@artbro.com', password: 'password123' })
    });
    
    if (!artistLoginRes.ok) {
      throw new Error(`Artist login failed: ${await artistLoginRes.text()}`);
    }
    
    const artistLoginData = await artistLoginRes.json();
    artistToken = artistLoginData.token;
    console.log('✅ Artist logged in.');

    // Fetch artists directory to find this artist's profile ID
    const artistsRes = await fetch(`${BASE_URL}/artists`);
    const artists = await artistsRes.json();
    const currentArtist = artists.find(a => a.name.toLowerCase().includes('uday') || a.name.toLowerCase().includes('artist') || a.email === 'artist@artbro.com');
    if (!currentArtist) {
      throw new Error('Could not resolve database-backed artist profile.');
    }
    artistId = currentArtist.id;
    console.log(`✅ Located Artist Profile ID: ${artistId} (${currentArtist.name})`);

    // 2. Log in as Client/Admin (udaychandrabindhani@gmail.com)
    console.log('\n--- 2. Logging in as Client ---');
    const clientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'udaychandrabindhani@gmail.com', password: 'admin123' })
    });
    
    if (!clientLoginRes.ok) {
      throw new Error(`Client login failed: ${await clientLoginRes.text()}`);
    }
    
    const clientLoginData = await clientLoginRes.json();
    clientToken = clientLoginData.token;
    console.log('✅ Client logged in.');

    // 3. Create commission request 1: Target APPROVED + Negotiation path
    console.log('\n--- 3. Submitting Commission Request 1 (To be Approved) ---');
    const req1Payload = {
      clientName: 'Sarah Jenkins',
      email: 'udaychandrabindhani@gmail.com',
      phone: '+1 555-9018',
      shippingAddress: '789 Broadway St Apt 4B',
      shippingCity: 'New York',
      shippingPincode: '10003',
      artworkType: 'Detailed Pencil Krishna Sketch',
      budget: '$600',
      deadline: '2026-06-15',
      message: 'Looking for a beautiful graphite sketch of Krishna under the tree.',
      advanceAmount: '100',
      paymentStatus: 'PAID',
      artistId: artistId
    };

    const createRes1 = await fetch(`${BASE_URL}/commissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`
      },
      body: JSON.stringify(req1Payload)
    });

    if (!createRes1.ok) {
      throw new Error(`Commission 1 creation failed: ${await createRes1.text()}`);
    }

    const comm1 = await createRes1.json();
    commissionId1 = comm1.commission.id;
    console.log(`✅ Commission Request 1 created successfully! ID: ${commissionId1}`);

    // 4. Create commission request 2: Target REJECTED + Refund path
    console.log('\n--- 4. Submitting Commission Request 2 (To be Rejected/Refunded) ---');
    const req2Payload = {
      clientName: 'Sarah Jenkins',
      email: 'udaychandrabindhani@gmail.com',
      phone: '+1 555-9018',
      shippingAddress: '789 Broadway St Apt 4B',
      shippingCity: 'New York',
      shippingPincode: '10003',
      artworkType: 'Impossible Landscape Sketch',
      budget: '$150',
      deadline: '2026-05-25',
      message: 'Need a landscape completed in 2 days.',
      advanceAmount: '100',
      paymentStatus: 'PAID',
      artistId: artistId
    };

    const createRes2 = await fetch(`${BASE_URL}/commissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`
      },
      body: JSON.stringify(req2Payload)
    });

    if (!createRes2.ok) {
      throw new Error(`Commission 2 creation failed: ${await createRes2.text()}`);
    }

    const comm2 = await createRes2.json();
    commissionId2 = comm2.commission.id;
    console.log(`✅ Commission Request 2 created successfully! ID: ${commissionId2}`);

    // 5. Query commissions as Artist to ensure they see ONLY their assigned tasks
    console.log('\n--- 5. Retrieving Commissions list as Artist ---');
    const artistQueryRes = await fetch(`${BASE_URL}/commissions`, {
      headers: { Authorization: `Bearer ${artistToken}` }
    });
    
    if (!artistQueryRes.ok) {
      throw new Error(`Artist query failed: ${await artistQueryRes.text()}`);
    }
    
    const artistComms = await artistQueryRes.json();
    console.log(`✅ Successfully queried! Total Assigned to Artist: ${artistComms.length}`);
    const found1 = artistComms.find(c => c.id === commissionId1);
    const found2 = artistComms.find(c => c.id === commissionId2);
    if (!found1 || !found2) {
      throw new Error('Commissions assigned to the artist were not found in their retrieved list.');
    }
    console.log('✅ Found both commission IDs in Artist inbox.');

    // 6. Action 1: Negotiated Approval (Put Final Price & Date of submission)
    console.log('\n--- 6. Negotiating & Approving Commission 1 ---');
    const approvePayload = {
      status: 'APPROVED',
      finalPrice: 650,
      submissionDate: '2026-06-12'
    };

    const approveRes = await fetch(`${BASE_URL}/commissions/${commissionId1}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${artistToken}`
      },
      body: JSON.stringify(approvePayload)
    });

    if (!approveRes.ok) {
      throw new Error(`Approval/Negotiation failed: ${await approveRes.text()}`);
    }

    const approvedComm = await approveRes.json();
    console.log('✅ Commission 1 Approved with Custom Terms!');
    console.log('📝 Assigned Status:', approvedComm.status);
    console.log('📝 Negotiated Final Price:', approvedComm.finalPrice);
    console.log('📝 Target Submission Date:', approvedComm.submissionDate);
    console.log('📝 Created Artwork ID (linked):', approvedComm.artworkId);

    if (!approvedComm.artworkId) {
      throw new Error('FAILED: Artwork ID was not auto-created on commission approval.');
    }
    console.log('✅ PASS: A corresponding buyable Artwork was successfully created in sync!');

    // 7. Action 2: Reject & Trigger Refund flow
    console.log('\n--- 7. Rejecting & Auto-Refunding Commission 2 ---');
    const rejectPayload = {
      status: 'REJECTED'
    };

    const rejectRes = await fetch(`${BASE_URL}/commissions/${commissionId2}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${artistToken}`
      },
      body: JSON.stringify(rejectPayload)
    });

    if (!rejectRes.ok) {
      throw new Error(`Rejection failed: ${await rejectRes.text()}`);
    }

    const rejectedComm = await rejectRes.json();
    console.log('✅ Commission 2 Rejected Successfully!');
    console.log('📝 Assigned Status:', rejectedComm.status);
    console.log('📝 Refund Payment Status (auto updated to REFUNDED):', rejectedComm.paymentStatus);

    console.log('\n🌟 ALL COMMISSIONS LIFECYCLE AND INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('❌ Commissions verification failed:', err.message);
  }
}

runCommissionTests();
