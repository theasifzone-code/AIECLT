// src/routes/adminRoutes.js - ✅ COMPLETE FIXED
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

// ✅ VALIDATE REQUEST
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const {
  getCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  sendNotification,
  getNotifications,
  getStats,
} = require('../controllers/adminController');

// ==================== VALIDATION RULES ====================

/**
 * Center validation rules
 */
const centerValidation = {
  create: [
    body('centerCode')
      .trim()
      .notEmpty().withMessage('Center code is required')
      .isLength({ min: 3, max: 10 }).withMessage('Center code must be 3-10 characters')
      .matches(/^[A-Z0-9]+$/).withMessage('Center code can only contain letters and numbers')
      .toUpperCase(),
    body('name').trim().notEmpty().withMessage('Center name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid center ID'),
    body('centerCode').optional().trim().toUpperCase(),
    body('name').optional().trim(),
    body('address').optional().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
  ],
  id: [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ],
};

/**
 * Schedule validation rules
 */
const scheduleValidation = {
  create: [
    body('examCenterId').isMongoId().withMessage('Invalid exam center ID'),
    body('examDate').isISO8601().withMessage('Invalid date format'),
    body('examTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid schedule ID'),
    body('examDate').optional().isISO8601(),
    body('examTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  id: [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ],
};

/**
 * User validation rules
 */
const userValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('role')
      .optional()
      .isIn(['student', 'board_official', 'admin']).withMessage('Invalid role'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role').optional().isIn(['student', 'board_official', 'admin']),
    body('isActive').optional().isBoolean(),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
  ],
  id: [
    param('id').isMongoId().withMessage('Invalid user ID format'),  // ✅ YEH ADD KAREIN
  ],
};

/**
 * Notification validation rules
 */
const notificationValidation = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('targetRole').optional().isIn(['all', 'students', 'board_official', 'admin']),
  ],
};

// ==================== ROUTES ====================

// All admin routes require authentication
router.use(protect);

// ==================== STATS ====================
router.get('/stats', authorize('admin'), getStats);

// ==================== CENTERS ====================
router.get('/centers', authorize('board_official', 'admin'), getCenters);
router.get('/centers/:id', authorize('board_official', 'admin'), centerValidation.id, validateRequest, getCenter);
router.post('/centers', authorize('board_official', 'admin'), centerValidation.create, validateRequest, createCenter);
router.put('/centers/:id', authorize('board_official', 'admin'), centerValidation.update, validateRequest, updateCenter);
router.delete('/centers/:id', authorize('board_official', 'admin'), centerValidation.id, validateRequest, deleteCenter);

// ==================== SCHEDULES ====================
router.get('/schedules', authorize('board_official', 'admin'), getSchedules);
router.get('/schedules/:id', authorize('board_official', 'admin'), scheduleValidation.id, validateRequest, getSchedule);
router.post('/schedules', authorize('board_official', 'admin'), scheduleValidation.create, validateRequest, createSchedule);
router.put('/schedules/:id', authorize('board_official', 'admin'), scheduleValidation.update, validateRequest, updateSchedule);
router.delete('/schedules/:id', authorize('board_official', 'admin'), scheduleValidation.id, validateRequest, deleteSchedule);

// ==================== USERS ====================
router.get('/users', authorize('admin'), getUsers);
router.get('/users/:id', authorize('admin'), userValidation.id, validateRequest, getUser);
router.post('/users', authorize('admin'), userValidation.create, validateRequest, createUser);
router.put('/users/:id', authorize('admin'), userValidation.update, validateRequest, updateUser);
router.delete('/users/:id', authorize('admin'), userValidation.id, validateRequest, deleteUser);

// ==================== NOTIFICATIONS ====================
router.post('/notifications', authorize('board_official', 'admin'), notificationValidation.create, validateRequest, sendNotification);
router.get('/notifications', authorize('board_official', 'admin'), getNotifications);

module.exports = router;