const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

let storage;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'art_gallery',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 2000, height: 2000, crop: 'limit' }], // High res limits
    },
  });
  console.log('Using Cloudinary storage configuration.');
} else {
  const uploadDir = path.join(__dirname, '../../uploads');
  const profilesDir = path.join(uploadDir, 'profiles');
  const artworksDir = path.join(uploadDir, 'artworks');
  const exhibitionsDir = path.join(uploadDir, 'exhibitions');
  const seedingDir = path.join(uploadDir, 'seeding');

  // Ensure all directories exist
  [uploadDir, profilesDir, artworksDir, exhibitionsDir, seedingDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let destFolder = uploadDir;
      if (file.fieldname === 'profileImage' || file.fieldname === 'avatar') {
        destFolder = profilesDir;
      } else if (file.fieldname === 'image' || file.fieldname === 'referenceImage') {
        destFolder = artworksDir;
      } else if (file.fieldname === 'bannerImage') {
        destFolder = exhibitionsDir;
      }
      cb(null, destFolder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  console.log('Cloudinary credentials missing or placeholders; falling back to local disk storage.');
}

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload, isCloudinaryConfigured };
