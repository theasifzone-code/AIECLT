const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
dotenv.config();
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const authRoutes = require('./src/routes/authRoutes');
const ocrRoutes = require('./src/routes/ocrRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const app = express();

app.set('trust proxy', 1);


// SECURITY MIDDLEWARE
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, 
  })
);

// CORS
const allowedOrigins = [
  'https://aieclt.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];
if (process.env.ADDITIONAL_ORIGINS) {
  allowedOrigins.push(...process.env.ADDITIONAL_ORIGINS.split(','));
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith('.vercel.app') && origin.includes('aieclt')) {
      return callback(null, true);
    }

    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
});

const ocrLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many OCR requests. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
});

app.use('/api', globalLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}
app.use(compression());

// BODY PARSER
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// STATIC FILES
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d', 
    etag: true,
  })
);


// API DOCUMENTATION
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'AI-ECLT Backend API',
    version: '1.0.0',
    description: 'AI-powered Examination Center Location Tracer',
    environment: process.env.NODE_ENV || 'development',
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
          assignOfficial: 'PUT /api/admin/centers/assign-official',
          centerStudents: 'GET /api/admin/centers/:centerId/students',
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
          centerById: 'GET /api/ocr/centers/:id',
          nearbyCenters: 'GET /api/ocr/centers/nearby/search',
          cities: 'GET /api/ocr/cities',
        },
      },
      route: {
        base: '/api/route',
        methods: {
          getRoute: 'POST /api/route/get-route',
          getETA: 'POST /api/route/get-eta',
          toCenter: 'POST /api/route/to-center',
          multiCenter: 'POST /api/route/multi-center',
          nearbyCenters: 'POST /api/route/nearby-centers',
          geocode: 'POST /api/route/geocode',
        },
      },
      schedules: {
        base: '/api/schedules',
        methods: {
          all: 'GET /api/schedules',
          student: 'GET /api/schedules/student',
          upcoming: 'GET /api/schedules/upcoming',
          stats: 'GET /api/schedules/stats',
          byCenter: 'GET /api/schedules/center/:centerId',
          dateRange: 'GET /api/schedules/date-range',
          register: 'POST /api/schedules/:id/register',
          unregister: 'POST /api/schedules/:id/unregister',
          updateStatus: 'PATCH /api/schedules/:id/status',
          publishResults: 'POST /api/schedules/:id/publish-results',
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
    health: 'GET /health',
  });
});


app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/ocr/extract-center', ocrLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);
// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('MongoDB connected');
    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Started at: ${new Date().toISOString()}`);
    });
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed');
          process.exit(0);
        } catch (err) {
          logger.error('Error closing MongoDB:', err.message);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};


process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  logger.error(err.stack);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  logger.error(err.stack);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

// module.exports = { app, startServer };
module.exports = app;