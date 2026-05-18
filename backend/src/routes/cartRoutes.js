const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All cart routes require authentication

router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.route('/:artworkId').put(updateCartItem).delete(removeFromCart);

module.exports = router;
