const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const ocrRoutes = require('./src/routes/ocrRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');

//LOAD ENVIRONMENT 
dotenv.config();

//INITIALIZE EXPRESS
const app = express();

//  SECURITY MIDDLEWARE 
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false, // <-- Vercel ke liye ye change karo
  })
);

// CORS - Cross-Origin 
const allowedOrigins = [
  'https://aieclt.vercel.app', // Apna frontend ka exact Vercel URL
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Rate Limiting 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(compression());

// BODY PARSER 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== API DOCUMENTATION ====================

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
      notifications: {
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

//  ROUTES 
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);

//  404 HANDLER 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

module.exports = app;


if (require.main === module) {
  const startServer = () => {
    connectDB(); // <-- Database ab yahan connect hoga
    try {
      app.listen(PORT, () => {
        console.log(`Server running on: http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  };
  
  startServer();

  process.on('unhandledRejection', (err) => {
    console.error(' Unhandled Rejection:', err);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });
}