const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

const {
  protect,
  authorize,
  admin,
  boardOfficial,
} = require('../middleware/auth');

const {
  sendNotification,
  getAdminNotifications,
  getAdminNotificationById,
  deleteNotification,
  updateNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');


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

const sendNotificationValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5, max: 5000 }).withMessage('Message must be 5-5000 characters'),

  body('targetRole')
    .optional()
    .isIn(['all', 'students', 'board_official', 'admin'])
    .withMessage('Invalid target role'),
  body('targetCenter')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid center ID'),

  body('targetGrade')
    .optional({ nullable: true })
    .isIn(['9', '10', '11', '12', 'other'])
    .withMessage('Invalid grade'),

  body('targetUserIds')
    .optional()
    .isArray().withMessage('targetUserIds must be an array'),

  body('type')
    .optional()
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
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid expiry date'),

  body('scheduledAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid scheduled date'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid notification ID'),
];

router.use(protect);

router.get('/my', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', idValidation, validateRequest, markAsRead);

router.post(
  '/',
  authorize('admin', 'board_official'),
  sendNotificationValidation,
  validateRequest,
  sendNotification
);

router.get(
  '/',
  authorize('admin', 'board_official'),
  getAdminNotifications
);

router.get(
  '/:id',
  authorize('admin', 'board_official'),
  idValidation,
  validateRequest,
  getAdminNotificationById
);

router.put(
  '/:id',
  authorize('admin', 'board_official'),
  idValidation,
  validateRequest,
  updateNotification
);

router.delete(
  '/:id',
  authorize('admin', 'board_official'),
  idValidation,
  validateRequest,
  deleteNotification
);


module.exports = router;