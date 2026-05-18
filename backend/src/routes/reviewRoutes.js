const express = require('express');
const router = express.Router();
const { addReview, getArtworkReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addReview);
router.get('/:artworkId', getArtworkReviews);

module.exports = router;
