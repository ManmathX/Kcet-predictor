require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const collegeRoutes = require('./routes/colleges');

const app = express();
const PORT = process.env.PORT || 5001;

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(helmet()); // Basic security headers

const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
  : []; // Empty array forces strict origin check if FRONTEND_URL is missing

if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: FRONTEND_URL is not set in production. CORS will block all requests.');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) 
    // OR if origin is in the allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-password'],
}));
app.use(express.json());

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use('/api/colleges', collegeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ──────────────────────────────────────────────
// Connect to MongoDB and start server
// ──────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kcet_colleges';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 College API: http://localhost:${PORT}/api/colleges`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
