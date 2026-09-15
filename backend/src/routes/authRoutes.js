const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
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


const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['student', 'board_official', 'admin']).withMessage('Invalid role selected'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
  body('examCenter')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid exam center ID'),

  body('rollNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Roll number must be 3-20 characters'),

  body('grade')
    .optional({ nullable: true })
    .isIn(['9', '10', '11', '12', 'other']).withMessage('Invalid grade'),

  body('board')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Board name too long'),

  body('city')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('City name too long'),
];


const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];


const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('City name too long'),

  body('preferences')
    .optional()
    .isObject().withMessage('Preferences must be an object'),

  body('grade')
    .optional({ nullable: true })
    .isIn(['9', '10', '11', '12', 'other']).withMessage('Invalid grade'),

  body('board')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Board name too long'),

  body('rollNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Roll number must be 3-20 characters'),

  body('dateOfBirth')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date of birth format'),
];


const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];


const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
];


const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];



router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validateRequest, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.put(
  '/update-profile',
  protect,
  updateProfileValidation,
  validateRequest,
  updateProfile
);

router.put(
  '/change-password',
  protect,
  changePasswordValidation,
  validateRequest,
  changePassword
);

router.post('/resend-verification', protect, resendVerification);


module.exports = router;