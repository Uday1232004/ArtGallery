const express = require('express');
const router = express.Router();
const { protect, adminOrArtist } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  addArtworkToHighlight,
  removeArtworkFromHighlight
} = require('../controllers/highlightController');

router.get('/artist/:artistId', getHighlights);
router.post('/', protect, adminOrArtist, upload.single('coverImage'), createHighlight);
router.put('/:id', protect, adminOrArtist, upload.single('coverImage'), updateHighlight);
router.delete('/:id', protect, adminOrArtist, deleteHighlight);
router.post('/:id/artworks', protect, adminOrArtist, addArtworkToHighlight);
router.delete('/items/:itemId', protect, adminOrArtist, removeArtworkFromHighlight);

module.exports = router;
