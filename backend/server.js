// server.js - ✅ FINAL FIXED & UPDATED (With Notification Routes)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import database connection
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const ocrRoutes = require('./src/routes/ocrRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes'); // ✅ NEW: Notification Routes

// ==================== LOAD ENVIRONMENT ====================
dotenv.config();

// ==================== CONNECT DATABASE ====================
connectDB();

// ==================== INITIALIZE EXPRESS ====================
const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Helmet - Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
  })
);

// CORS - Cross-Origin Resource Sharing
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ==================== LOGGING ====================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== COMPRESSION ====================
app.use(compression());

// ==================== BODY PARSER ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== API DOCUMENTATION ====================

/**
 * @route   GET /
 * @desc    API root with documentation
 * @access  Public
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'AI-ECLT Backend API',
    version: '1.0.0',
    description: 'AI-powered Examination Center Location Tracer',
    environment: process.env.NODE_ENV || 'development',
    documentation: 'https://documenter.getpostman.com/view/your-docs',
    endpoints: {
      auth: {
        base: '/api/auth',
        methods: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/me',
          updateProfile: 'PUT /api/auth/update-profile',
          changePassword: 'PUT /api/auth/change-password',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'POST /api/auth/reset-password/:token',
          verifyEmail: 'GET /api/auth/verify-email/:token',
        },
      },
      admin: {
        base: '/api/admin',
        methods: {
          centers: 'GET /api/admin/centers',
          createCenter: 'POST /api/admin/centers',
          updateCenter: 'PUT /api/admin/centers/:id',
          deleteCenter: 'DELETE /api/admin/centers/:id',
          schedules: 'GET /api/admin/schedules',
          createSchedule: 'POST /api/admin/schedules',
          users: 'GET /api/admin/users',
          createUser: 'POST /api/admin/users',
          notifications: 'POST /api/admin/notifications',
          stats: 'GET /api/admin/stats',
        },
      },
      ocr: {
        base: '/api/ocr',
        methods: {
          extractCenter: 'POST /api/ocr/extract-center',
          manualSearch: 'POST /api/ocr/manual-center',
          centers: 'GET /api/ocr/centers',
          cities: 'GET /api/ocr/cities',
        },
      },
      route: {
        base: '/api/route',
        methods: {
          getRoute: 'POST /api/route/get-route',
          getETA: 'POST /api/route/get-eta',
          nearbyCenters: 'POST /api/route/nearby-centers',
          geocode: 'POST /api/route/geocode',
        },
      },
      notifications: { // ✅ NEW: Notification endpoints
        base: '/api/notifications',
        methods: {
          myNotifications: 'GET /api/notifications/my',
          unreadCount: 'GET /api/notifications/unread-count',
          markAsRead: 'PUT /api/notifications/:id/read',
          markAllAsRead: 'PUT /api/notifications/read-all',
        },
      },
    },
    health: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      mongodb: 'connected',
    },
  });
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: 'connected',
  });
});

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/notifications', notificationRoutes); // ✅ NEW: Notification Routes Register Kiye

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

let server; // ✅ Server variable declare kiya

const startServer = () => {
  try {
    server = app.listen(PORT, () => { // ✅ Server ko variable mein assign kiya
      console.log('');
      console.log('='.repeat(60));
      console.log('🚀 AI-ECLT Backend Server');
      console.log('='.repeat(60));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 MongoDB: Connected`);
      console.log('');
      console.log('📌 API Endpoints:');
      console.log(`   - Auth:     http://localhost:${PORT}/api/auth`);
      console.log(`   - Admin:    http://localhost:${PORT}/api/admin`);
      console.log(`   - OCR:      http://localhost:${PORT}/api/ocr`);
      console.log(`   - Route:    http://localhost:${PORT}/api/route`);
      console.log(`   - Notif:    http://localhost:${PORT}/api/notifications`);
      console.log('');
      console.log('📖 API Documentation: http://localhost:${PORT}/');
      console.log('='.repeat(60));
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ==================== UNHANDLED ERRORS ====================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Gracefully shutdown
  if (server) server.close(() => process.exit(1));
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('💀 Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// ==================== EXPORT ====================
module.exports = app;

// ==================== START ====================
startServer();