const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const membershipRoutes = require('./routes/memberships');
const rewardRoutes = require('./routes/rewards');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const eventRoutes = require('./routes/events');
const paymentRoutes = require('./routes/payments');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RC Battleground REST API Server', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🏎️ RC Battleground Backend Server running on http://localhost:${PORT}`);
});
