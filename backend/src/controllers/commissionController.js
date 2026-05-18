const prisma = require('../utils/prismaClient');

// @desc    Submit a commission request
// @route   POST /api/commissions
// @access  Public
const createCommission = async (req, res) => {
  try {
    const { clientName, email, artworkType, budget, deadline, message } = req.body;
    const referenceImage = req.file ? req.file.path : null;

    const commission = await prisma.commission.create({
      data: {
        clientName,
        email,
        artworkType,
        budget,
        deadline: deadline ? new Date(deadline) : null,
        message,
        referenceImage,
      }
    });
    res.status(201).json({ message: 'Commission request submitted successfully', commission });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all commissions (Admin)
// @route   GET /api/commissions
// @access  Private
const getCommissions = async (req, res) => {
  try {
    const commissions = await prisma.commission.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update commission status
// @route   PUT /api/commissions/:id/status
// @access  Private
const updateCommissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const commission = await prisma.commission.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(commission);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createCommission, getCommissions, updateCommissionStatus };
