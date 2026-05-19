const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ArtBro Sketches API is running' });
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
app.listen(PORT, () => {
  console.log(`🎨 ArtBro Sketches API running on port ${PORT}`);
});
