require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(localPath, folderName) {
  if (!fs.existsSync(localPath)) {
    console.log(`File not found: ${localPath}`);
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: `art_gallery/${folderName}`,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload failed for ${localPath}:`, error.message);
    return null;
  }
}

function getLocalPath(dbUrl) {
  // Typical dbUrl: "/uploads/artworks/filename.jpg"
  // Convert to absolute local path
  if (!dbUrl || dbUrl.startsWith('http://') || dbUrl.startsWith('https://')) {
    return null; // Already cloud or invalid
  }
  // Remove leading slash if any
  const relativePath = dbUrl.startsWith('/') ? dbUrl.slice(1) : dbUrl;
  return path.join(__dirname, '..', relativePath);
}

async function main() {
  console.log('Starting Cloudinary migration...');

  // 1. Migrate Artworks
  const artworks = await prisma.artwork.findMany();
  for (const artwork of artworks) {
    const localPath = getLocalPath(artwork.image);
    if (localPath) {
      console.log(`Migrating artwork: ${artwork.title}...`);
      const cloudUrl = await uploadToCloudinary(localPath, 'artworks');
      if (cloudUrl) {
        await prisma.artwork.update({
          where: { id: artwork.id },
          data: { image: cloudUrl },
        });
        console.log(`✅ Updated artwork ${artwork.title} to ${cloudUrl}`);
      }
    }
  }

  // 2. Migrate Artists Profile Images
  const artists = await prisma.artist.findMany();
  for (const artist of artists) {
    if (artist.profileImage) {
      const localPath = getLocalPath(artist.profileImage);
      if (localPath) {
        console.log(`Migrating artist profile: ${artist.name}...`);
        const cloudUrl = await uploadToCloudinary(localPath, 'profiles');
        if (cloudUrl) {
          await prisma.artist.update({
            where: { id: artist.id },
            data: { profileImage: cloudUrl },
          });
          console.log(`✅ Updated artist profile to ${cloudUrl}`);
        }
      }
    }
  }

  // 3. Migrate Users Profile Images
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.profileImage) {
      const localPath = getLocalPath(user.profileImage);
      if (localPath) {
        console.log(`Migrating user profile: ${user.name}...`);
        const cloudUrl = await uploadToCloudinary(localPath, 'profiles');
        if (cloudUrl) {
          await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: cloudUrl },
          });
          console.log(`✅ Updated user profile to ${cloudUrl}`);
        }
      }
    }
  }

  // 4. Migrate Exhibition Banners
  const exhibitions = await prisma.exhibition.findMany();
  for (const exhibition of exhibitions) {
    if (exhibition.bannerImage) {
      const localPath = getLocalPath(exhibition.bannerImage);
      if (localPath) {
        console.log(`Migrating exhibition banner: ${exhibition.name}...`);
        const cloudUrl = await uploadToCloudinary(localPath, 'exhibitions');
        if (cloudUrl) {
          await prisma.exhibition.update({
            where: { id: exhibition.id },
            data: { bannerImage: cloudUrl },
          });
          console.log(`✅ Updated exhibition banner to ${cloudUrl}`);
        }
      }
    }
  }

  console.log('🎉 Migration completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
