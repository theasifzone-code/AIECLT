const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const {
  protect,
  authorize,
  admin,
  boardOfficial,
  student,
  checkCenterAccess,
} = require('../middleware/auth');

const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getStudentSchedules,
  getScheduleStats,
  getUpcomingSchedules,
  getSchedulesByCenter,
  getScheduleByDateRange,
  registerStudentForSchedule,
  unregisterStudentFromSchedule,
  updateScheduleStatus,
  publishResults,
} = require('../controllers/scheduleController');

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

const createScheduleValidation = [
  body('examCenterId')
    .isMongoId().withMessage('Invalid exam center ID'),

  body('examDate')
    .isISO8601().withMessage('Invalid date format'),

  body('examTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 2, max: 100 }).withMessage('Subject must be 2-100 characters'),

  body('grade')
    .optional({ nullable: true })
    .isIn(['9', '10', '11', '12', 'other'])
    .withMessage('Invalid grade'),

  body('totalStudents')
    .optional()
    .isInt({ min: 0, max: 10000 }).withMessage('Invalid total students'),

  body('duration')
    .optional()
    .isInt({ min: 30, max: 480 }).withMessage('Duration must be 30-480 minutes'),

  body('students')
    .optional()
    .isArray().withMessage('Students must be an array'),

  body('students.*')
    .optional()
    .isMongoId().withMessage('Invalid student ID'),
];

const updateScheduleValidation = [
  param('id').isMongoId().withMessage('Invalid schedule ID'),

  body('examDate').optional().isISO8601().withMessage('Invalid date format'),

  body('examTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format'),

  body('subject')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Subject must be 2-100 characters'),

  body('grade')
    .optional({ nullable: true })
    .isIn(['9', '10', '11', '12', 'other'])
    .withMessage('Invalid grade'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid schedule ID'),
];

const centerIdValidation = [
  param('centerId').isMongoId().withMessage('Invalid center ID'),
];

const dateRangeValidation = [
  query('startDate').isISO8601().withMessage('Invalid startDate'),
  query('endDate').isISO8601().withMessage('Invalid endDate'),
];

const statusValidation = [
  body('status')
    .isIn(['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'])
    .withMessage('Invalid status'),
];

router.use(protect);

router.get('/student', student, getStudentSchedules);
router.get('/upcoming', getUpcomingSchedules);
router.get('/stats', admin, getScheduleStats);

router.get(
  '/center/:centerId',
  authorize('admin', 'board_official'),
  centerIdValidation,
  validateRequest,
  checkCenterAccess,
  getSchedulesByCenter
);

router.get(
  '/date-range',
  authorize('admin', 'board_official'),
  dateRangeValidation,
  validateRequest,
  getScheduleByDateRange
);

router.get(
  '/',
  authorize('admin', 'board_official'),
  getAllSchedules
);

router.post(
  '/',
  authorize('admin', 'board_official'),
  createScheduleValidation,
  validateRequest,
  createSchedule
);

router.post(
  '/:id/register',
  student,
  idValidation,
  validateRequest,
  registerStudentForSchedule
);

router.post(
  '/:id/unregister',
  student,
  idValidation,
  validateRequest,
  unregisterStudentFromSchedule
);


router.patch(
  '/:id/status',
  authorize('admin', 'board_official'),
  idValidation,
  statusValidation,
  validateRequest,
  updateScheduleStatus
);


router.post(
  '/:id/publish-results',
  authorize('admin', 'board_official'),
  idValidation,
  validateRequest,
  publishResults
);


router.get(
  '/:id',
  authorize('admin', 'board_official', 'student'),
  idValidation,
  validateRequest,
  getScheduleById
);

router.put(
  '/:id',
  authorize('admin', 'board_official'),
  updateScheduleValidation,
  validateRequest,
  updateSchedule
);

router.delete(
  '/:id',
  authorize('admin', 'board_official'),
  idValidation,
  validateRequest,
  deleteSchedule
);


module.exports = router;