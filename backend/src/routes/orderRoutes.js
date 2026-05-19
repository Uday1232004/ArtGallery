const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
} = require('../controllers/orderController');
const { protect, superAdminOnly, adminOrArtist } = require('../middlewares/authMiddleware');

// User routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin/Artist routes
router.get('/', protect, adminOrArtist, getAllOrders);
router.put('/:id/status', protect, adminOrArtist, updateOrderStatus);

// Users management (placed here for convenience, admin only)
router.get('/admin/users', protect, superAdminOnly, getAllUsers);

module.exports = router;
