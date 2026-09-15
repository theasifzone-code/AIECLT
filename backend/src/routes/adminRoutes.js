const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const {
  protect,
  authorize,
  admin,
  boardOfficial,
  checkCenterAccess,
} = require('../middleware/auth');

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
  assignBoardOfficial,
  getCenterStudents,
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
const optional = () => ({
  nullable: true,
  checkFalsy: true,
});

const centerValidation = {
  create: [
    body('centerCode')
      .trim()
      .notEmpty().withMessage('Center code is required')
      .isLength({ min: 3, max: 10 }).withMessage('Center code must be 3-10 characters')
      .matches(/^[A-Z0-9]+$/).withMessage('Center code can only contain letters and numbers')
      .toUpperCase(),

    body('name')
      .trim()
      .notEmpty().withMessage('Center name is required'),

    body('address')
      .trim()
      .notEmpty().withMessage('Address is required'),

    body('latitude')
      .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

    body('longitude')
      .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),

    body('city')
      .trim()
      .notEmpty().withMessage('City is required'),
    body('state')
      .optional(optional())
      .trim(),

    body('capacity')
      .optional(optional())
      .isInt({ min: 1 }).withMessage('Capacity must be a positive number'),

    body('contactNumber')
      .optional(optional())
      .trim(),

    body('contactEmail')
      .optional(optional())
      .trim(),
    body('boardOfficial')
      .optional(optional())
      .isMongoId().withMessage('Invalid board official ID'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid center ID'),

    body('centerCode')
      .optional(optional())
      .trim()
      .toUpperCase(),

    body('name')
      .optional(optional())
      .trim(),

    body('address')
      .optional(optional())
      .trim(),

    body('city')
      .optional(optional())
      .trim(),

    body('state')
      .optional(optional())
      .trim(),

    body('latitude')
      .optional(optional())
      .isFloat({ min: -90, max: 90 }),

    body('longitude')
      .optional(optional())
      .isFloat({ min: -180, max: 180 }),

    body('capacity')
      .optional(optional())
      .isInt({ min: 1 }),

    body('contactNumber')
      .optional(optional())
      .trim(),

    body('contactEmail')
      .optional(optional())
      .trim(),
    body('boardOfficial')
      .optional(optional())
      .isMongoId().withMessage('Invalid board official ID'),
  ],

  id: [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ],
};

const scheduleValidation = {
  create: [
    body('examCenterId')
      .isMongoId().withMessage('Invalid exam center ID'),

    body('examDate')
      .isISO8601().withMessage('Invalid date format'),

    body('examTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:MM)'),

    body('subject')
      .trim()
      .notEmpty().withMessage('Subject is required'),

    body('subjectCode')
      .optional(optional())
      .trim()
      .toUpperCase(),

    body('grade')
      .optional(optional())
      .isIn(['9', '10', '11', '12', 'other'])
      .withMessage('Invalid grade'),

    body('totalStudents')
      .optional(optional())
      .isInt({ min: 0, max: 10000 }),

    body('duration')
      .optional(optional())
      .isInt({ min: 30, max: 480 }),

    body('roomNumber')
      .optional(optional())
      .trim(),

    body('students')
      .optional(optional())
      .isArray().withMessage('Students must be an array'),

    body('students.*')
      .optional(optional())
      .isMongoId().withMessage('Invalid student ID'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid schedule ID'),

    body('examDate')
      .optional(optional())
      .isISO8601(),

    body('examTime')
      .optional(optional())
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),

    body('subject')
      .optional(optional())
      .trim(),

    body('grade')
      .optional(optional())
      .isIn(['9', '10', '11', '12', 'other']),

    body('status')
      .optional(optional())
      .isIn(['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed']),
  ],

  id: [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ],
};


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

    body('password')
      .optional(optional())
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('role')
      .optional(optional())
      .isIn(['student', 'board_official', 'admin']).withMessage('Invalid role'),
    body('examCenter')
      .optional(optional())
      .isMongoId().withMessage('Invalid exam center ID'),

    body('assignedCenter')
      .optional(optional())
      .isMongoId().withMessage('Invalid assigned center ID'),

    body('rollNumber')
      .optional(optional())
      .trim(),

    body('registrationNumber')
      .optional(optional())
      .trim(),

    body('grade')
      .optional(optional())
      .isIn(['9', '10', '11', '12', 'other'])
      .withMessage('Invalid grade'),

    body('board')
      .optional(optional())
      .trim(),

    body('city')
      .optional(optional())
      .trim(),

    body('phone')
      .optional(optional())
      .trim(),

    body('country')
      .optional(optional())
      .trim(),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid user ID'),

    body('role')
      .optional(optional())
      .isIn(['student', 'board_official', 'admin']),

    body('isActive')
      .optional({ nullable: true }) 
      .isBoolean(),

    body('name')
      .optional(optional())
      .trim()
      .isLength({ min: 2, max: 50 }),

    body('email')
      .optional(optional())
      .trim()
      .isEmail(),

    body('phone')
      .optional(optional())
      .trim(),

    body('city')
      .optional(optional())
      .trim(),

    body('examCenter')
      .optional(optional())
      .isMongoId(),

    body('assignedCenter')
      .optional(optional())
      .isMongoId(),

    body('rollNumber')
      .optional(optional())
      .trim(),

    body('grade')
      .optional(optional())
      .isIn(['9', '10', '11', '12', 'other']),

    body('board')
      .optional(optional())
      .trim(),
  ],

  id: [
    param('id').isMongoId().withMessage('Invalid user ID format'),
  ],
};

const notificationValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),

    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 5, max: 5000 }).withMessage('Message must be 5-5000 characters'),

    body('targetRole')
      .optional(optional())
      .isIn(['all', 'students', 'board_official', 'admin'])
      .withMessage('Invalid target role'),

    body('targetCenter')
      .optional(optional())
      .isMongoId().withMessage('Invalid center ID'),

    body('targetGrade')
      .optional(optional())
      .isIn(['9', '10', '11', '12', 'other'])
      .withMessage('Invalid grade'),

    body('type')
      .optional(optional())
      .isIn([
        'general',
        'exam_update',
        'schedule_reminder',
        'result_announcement',
        'system_alert',
        'center_update',
      ])
      .withMessage('Invalid type'),

    body('priority')
      .optional(optional())
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
  ],
};

router.use(protect);
router.get('/stats', admin, getStats);

router.get('/centers', authorize('admin', 'board_official'), getCenters);

router.get(
  '/centers/:id',
  authorize('admin', 'board_official'),
  centerValidation.id,
  validateRequest,
  getCenter
);

router.post(
  '/centers',
  admin,
  centerValidation.create,
  validateRequest,
  createCenter
);

router.put(
  '/centers/:id',
  authorize('admin', 'board_official'),
  centerValidation.update,
  validateRequest,
  updateCenter
);

router.delete(
  '/centers/:id',
  admin,
  centerValidation.id,
  validateRequest,
  deleteCenter
);

router.put(
  '/centers/assign-official',
  admin,
  [
    body('centerId').isMongoId().withMessage('Invalid center ID'),
    body('officialId').isMongoId().withMessage('Invalid official ID'),
  ],
  validateRequest,
  assignBoardOfficial
);

router.get(
  '/centers/:centerId/students',
  authorize('admin', 'board_official'),
  [param('centerId').isMongoId().withMessage('Invalid center ID')],
  validateRequest,
  checkCenterAccess,
  getCenterStudents
);

router.get('/schedules', authorize('admin', 'board_official'), getSchedules);

router.get(
  '/schedules/:id',
  authorize('admin', 'board_official'),
  scheduleValidation.id,
  validateRequest,
  getSchedule
);

router.post(
  '/schedules',
  authorize('admin', 'board_official'),
  scheduleValidation.create,
  validateRequest,
  createSchedule
);

router.put(
  '/schedules/:id',
  authorize('admin', 'board_official'),
  scheduleValidation.update,
  validateRequest,
  updateSchedule
);

router.delete(
  '/schedules/:id',
  authorize('admin', 'board_official'),
  scheduleValidation.id,
  validateRequest,
  deleteSchedule
);

router.get('/users', admin, getUsers);
router.get('/users/:id', admin, userValidation.id, validateRequest, getUser);
router.post('/users', admin, userValidation.create, validateRequest, createUser);
router.put('/users/:id', admin, userValidation.update, validateRequest, updateUser);
router.delete('/users/:id', admin, userValidation.id, validateRequest, deleteUser);


router.post(
  '/notifications',
  authorize('admin', 'board_official'),
  notificationValidation.create,
  validateRequest,
  sendNotification
);

router.get(
  '/notifications',
  authorize('admin', 'board_official'),
  getNotifications
);


module.exports = router;