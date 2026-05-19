const express = require('express');
const router = express.Router();
const { createCommission, getCommissions, updateCommissionStatus } = require('../controllers/commissionController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .post(protect, upload.single('referenceImage'), createCommission)
  .get(protect, getCommissions);

router.route('/:id/status')
  .put(protect, updateCommissionStatus);

module.exports = router;
