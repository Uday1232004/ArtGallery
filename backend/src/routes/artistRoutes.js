const express = require('express');
const router = express.Router();
const { getArtists, getArtistById, createArtist, updateArtist } = require('../controllers/artistController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getArtists)
  .post(protect, upload.single('profileImage'), createArtist);

router.route('/:id')
  .get(getArtistById)
  .put(protect, upload.single('profileImage'), updateArtist);

module.exports = router;
