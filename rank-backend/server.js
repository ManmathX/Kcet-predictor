require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const collegeRoutes = require('./routes/colleges');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5001;

// ──────────────────────────────────────────────
// Global Rate Limiting & Security
// ──────────────────────────────────────────────
app.use(helmet());

// Global rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  next();
});

const allowedOrigins = [
  'https://predictors2-0-iedq.vercel.app',
  'https://predictors2-0.vercel.app',
  'https://collegecutoff.in',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

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
app.use(express.json({ limit: '10mb' }));

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use('/api/colleges', collegeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

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
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    bufferCommands: false,
  })
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
