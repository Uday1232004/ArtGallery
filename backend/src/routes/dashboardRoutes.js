const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/analytics').get(protect, getAnalytics);

module.exports = router;
