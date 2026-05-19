const express = require('express');
const router = express.Router();
const {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} = require('../controllers/artworkController');
const { protect, superAdminOnly, adminOnly, adminOrArtist } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getArtworks)
  .post(protect, adminOrArtist, upload.single('image'), createArtwork);

router.route('/:id')
  .get(getArtworkById)
  .put(protect, adminOrArtist, upload.single('image'), updateArtwork)
  .delete(protect, superAdminOnly, deleteArtwork);

module.exports = router;
