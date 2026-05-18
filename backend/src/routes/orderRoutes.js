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
const { protect, superAdminOnly } = require('../middlewares/authMiddleware');

// User routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/', protect, superAdminOnly, getAllOrders);
router.put('/:id/status', protect, superAdminOnly, updateOrderStatus);

// Users management (placed here for convenience, admin only)
router.get('/admin/users', protect, superAdminOnly, getAllUsers);

module.exports = router;
