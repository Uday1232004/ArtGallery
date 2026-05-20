const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Checks ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ArtBro Sketches API is running' });
});

app.get('/api/db-health', async (req, res) => {
  try {
    const prisma = require('./utils/prismaClient');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', database: 'connected', message: 'MySQL Database connection is fully operational' });
  } catch (error) {
    console.error('Database Health Check Failed:', error);
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// ─── Import Routes ─────────────────────────────────────
const authRoutes       = require('./routes/authRoutes');
const artworkRoutes    = require('./routes/artworkRoutes');
const artistRoutes     = require('./routes/artistRoutes');
const exhibitionRoutes = require('./routes/exhibitionRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');
const cartRoutes       = require('./routes/cartRoutes');
const wishlistRoutes   = require('./routes/wishlistRoutes');
const orderRoutes      = require('./routes/orderRoutes');
const reviewRoutes     = require('./routes/reviewRoutes');
const highlightRoutes  = require('./routes/highlightRoutes');

// ─── Register Routes ───────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/artworks',    artworkRoutes);
app.use('/api/artists',     artistRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/wishlist',    wishlistRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/reviews',     reviewRoutes);
app.use('/api/highlights',  highlightRoutes);

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

async function runStartupDiagnostics() {
  console.log('🔍 Starting Asset Diagnostics...');
  const prisma = require('./utils/prismaClient');
  
  try {
    // 1. Validate Artworks
    const artworks = await prisma.artwork.findMany({
      select: { title: true, image: true }
    });
    for (const art of artworks) {
      if (art.image && !art.image.startsWith('http')) {
        const relativePath = art.image.startsWith('/') ? art.image.substring(1) : art.image;
        const fullPath = path.join(__dirname, '..', relativePath);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Warning: Missing artwork file for "${art.title}" at expected path: ${fullPath}`);
        }
      }
    }

    // 2. Validate Artists
    const artists = await prisma.artist.findMany({
      select: { name: true, profileImage: true }
    });
    for (const artist of artists) {
      if (artist.profileImage && !artist.profileImage.startsWith('http')) {
        const relativePath = artist.profileImage.startsWith('/') ? artist.profileImage.substring(1) : artist.profileImage;
        const fullPath = path.join(__dirname, '..', relativePath);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Warning: Missing profile image for artist "${artist.name}" at expected path: ${fullPath}`);
        }
      }
    }

    // 3. Validate User Avatars
    const users = await prisma.user.findMany({
      select: { name: true, email: true, avatar: true }
    });
    for (const user of users) {
      if (user.avatar && !user.avatar.startsWith('http')) {
        const relativePath = user.avatar.startsWith('/') ? user.avatar.substring(1) : user.avatar;
        const fullPath = path.join(__dirname, '..', relativePath);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Warning: Missing avatar image for user "${user.name}" (${user.email}) at expected path: ${fullPath}`);
        }
      }
    }

    // 4. Validate Exhibition Banners
    const exhibitions = await prisma.exhibition.findMany({
      select: { name: true, bannerImage: true }
    });
    for (const ex of exhibitions) {
      if (ex.bannerImage && !ex.bannerImage.startsWith('http')) {
        const relativePath = ex.bannerImage.startsWith('/') ? ex.bannerImage.substring(1) : ex.bannerImage;
        const fullPath = path.join(__dirname, '..', relativePath);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Warning: Missing banner image for exhibition "${ex.name}" at expected path: ${fullPath}`);
        }
      }
    }
    console.log('✅ Asset Diagnostics completed.');
  } catch (error) {
    console.error('❌ Diagnostics failed:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🎨 ArtBro Sketches API running on port ${PORT}`);
  await runStartupDiagnostics();
});

