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
  allowedOrigins.push(
    ...process.env.ADDITIONAL_ORIGINS.split(',').map((o) => o.trim())
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
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

// RATE LIMITERS
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

// LOGGING
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

// BODY PARSERS + COMPRESSION
app.use(compression());
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

//  DB CONNECTION MIDDLEWARE
let dbConnectedOnce = false;

app.use(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  try {
    await connectDB();
    if (!dbConnectedOnce) {
      logger.info('Database ready for requests');
      dbConnectedOnce = true;
    }
    next();
  } catch (err) {
    logger.error('Database middleware failed:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again.',
    });
  }
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    status: 'OK',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: states[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});


// API DOCUMENTATION 
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'AI-ECLT Backend API',
    version: '1.0.0',
    description: 'AI-powered Examination Center Location Tracer',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: { base: '/api/auth' },
      admin: { base: '/api/admin' },
      ocr: { base: '/api/ocr' },
      route: { base: '/api/route' },
      schedules: { base: '/api/schedules' },
      notifications: { base: '/api/notifications' },
    },
    health: 'GET /health',
  });
});

// RATE LIMITER ON SPECIFIC ROUTES
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/ocr/extract-center', ocrLimiter);

// GLOBAL API LIMITER
app.use('/api', globalLimiter);

// ROUTES
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


// ERROR HANDLER
app.use(errorHandler);


// LOCAL DEV SERVER 
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

// GLOBAL ERROR HANDLERS
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err.message);
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }
});

// ============================================
// DUAL EXPORT: 
//   - Local dev: startServer() run
//   - Vercel: app default export hota hai
// ============================================
if (require.main === module) {
  startServer();
}

module.exports = app;