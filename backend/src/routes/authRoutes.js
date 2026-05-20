const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

module.exports = router;
