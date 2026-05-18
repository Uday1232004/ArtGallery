const express = require('express');
const router = express.Router();
const { 
  getExhibitions, 
  getExhibitionById, 
  createExhibition, 
  updateExhibition, 
  deleteExhibition 
} = require('../controllers/exhibitionController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getExhibitions)
  .post(protect, upload.single('bannerImage'), createExhibition);

router.route('/:id')
  .get(getExhibitionById)
  .put(protect, upload.single('bannerImage'), updateExhibition)
  .delete(protect, deleteExhibition);

module.exports = router;
