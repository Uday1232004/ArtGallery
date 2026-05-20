const prisma = require('../utils/prismaClient');
const path = require('path');

// @desc    Submit a commission request
// @route   POST /api/commissions
// @access  Public (Optionally authenticated)
const createCommission = async (req, res) => {
  try {
    const { 
      clientName, 
      email, 
      phone, 
      artworkType, 
      budget, 
      deadline, 
      message,
      shippingAddress,
      shippingCity,
      shippingPincode,
      advanceAmount,
      paymentStatus,
      artistId,
      referenceImage: referenceImageUrl
    } = req.body;

    let referenceImage = referenceImageUrl || '';
    
    // File upload support (Cloudinary or local disk)
    if (req.file) {
      if (req.file.path.startsWith('http://') || req.file.path.startsWith('https://')) {
        referenceImage = req.file.path;
      } else {
        referenceImage = `/uploads/commissions/${path.basename(req.file.path)}`;
      }
    }

    if (!clientName || !email || !phone || !shippingAddress || !shippingCity || !shippingPincode) {
      return res.status(400).json({ message: 'Name, email, phone, and complete shipping details are required' });
    }

    const commission = await prisma.commission.create({
      data: {
        clientName,
        email,
        phone,
        artworkType,
        budget: budget || null,
        deadline: deadline ? new Date(deadline) : null,
        message: message || '',
        referenceImage: referenceImage || null,
        shippingAddress,
        shippingCity,
        shippingPincode,
        advanceAmount: advanceAmount ? parseFloat(advanceAmount) : 100.0,
        paymentStatus: paymentStatus || 'PAID',
        artistId: artistId || null,
      },
      include: {
        artist: true
      }
    });

    res.status(201).json({ message: 'Commission request submitted successfully', commission });
  } catch (error) {
    console.error('Error creating commission:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all commissions (Admin or Artist-filtered)
// @route   GET /api/commissions
// @access  Private
const getCommissions = async (req, res) => {
  try {
    let whereClause = {};

    // Filter based on roles
    if (req.user.role === 'ARTIST') {
      const artistProfile = await prisma.artist.findFirst({
        where: {
          OR: [
            { user: { id: req.user.id } },
            { name: req.user.name }
          ]
        }
      });

      if (artistProfile) {
        whereClause.artistId = artistProfile.id;
      } else {
        return res.json([]); // Return empty if artist profile doesn't exist yet
      }
    } else if (req.user.role === 'USER') {
      // Collectors can only fetch their own submitted commissions
      whereClause.email = req.user.email;
    }

    const commissions = await prisma.commission.findMany({
      where: whereClause,
      include: {
        artist: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(commissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update commission status & negotiate pricing/deadline
// @route   PUT /api/commissions/:id/status
// @access  Private (Admin or Artist)
const updateCommissionStatus = async (req, res) => {
  try {
    const { status, finalPrice, submissionDate } = req.body;
    
    const existingCommission = await prisma.commission.findUnique({
      where: { id: req.params.id }
    });

    if (!existingCommission) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    let updateData = { status };

    if (status === 'APPROVED') {
      if (!finalPrice || !submissionDate) {
        return res.status(400).json({ message: 'Final Price and Submission Date are required for approval.' });
      }
      updateData.finalPrice = parseFloat(finalPrice);
      updateData.submissionDate = new Date(submissionDate);

      // Instantiate a new, purchasable custom Artwork record linked to this commission
      if (!existingCommission.artworkId) {
        const customArtwork = await prisma.artwork.create({
          data: {
            title: `Custom Sketch: ${existingCommission.artworkType}`,
            description: `Commissioned custom sketch request from ${existingCommission.clientName}. Description: ${existingCommission.message}`,
            artworkStory: `A bespoke custom sketch crafted by master artist.`,
            category: 'PORTRAIT',
            medium: 'Graphite / Pencil Custom Media',
            price: parseFloat(finalPrice),
            status: 'AVAILABLE',
            yearCreated: new Date().getFullYear(),
            dimensions: 'Custom',
            image: existingCommission.referenceImage || '/placeholder.jpg',
            artistId: existingCommission.artistId || ''
          }
        });
        updateData.artworkId = customArtwork.id;
      } else {
        // If the artwork record already exists, ensure price is dynamically updated in sync
        await prisma.artwork.update({
          where: { id: existingCommission.artworkId },
          data: { price: parseFloat(finalPrice) }
        });
      }
    } else if (status === 'REJECTED') {
      // Simulate refundable logic by marking advance payment refunded
      updateData.paymentStatus = 'REFUNDED';
    }

    const commission = await prisma.commission.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        artist: true
      }
    });

    res.json(commission);
  } catch (error) {
    console.error('Error updating commission status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createCommission, getCommissions, updateCommissionStatus };
