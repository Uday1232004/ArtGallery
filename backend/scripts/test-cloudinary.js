require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ROOT',
  api_key: '632398865617739',
  api_secret: '_38OE7ScbwZ6wTBjSC4SU6HYeFY',
});

cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Failed to connect to Cloudinary:', error.message);
  } else {
    console.log('Successfully connected to Cloudinary:', result);
  }
});
