
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
  resendVerification
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');


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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
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
  
  body('preferences')
    .optional()
    .isObject().withMessage('Preferences must be an object'),
];


const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];


router.post(
  '/register',
  registerValidation,
  validateRequest,
  register
);


router.post(
  '/login',
  loginValidation,
  validateRequest,
  login
);


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


router.post(
  '/forgot-password',
  forgotPasswordValidation,
  validateRequest,
  forgotPassword
);


router.post(
  '/reset-password/:token',
  resetPasswordValidation,
  validateRequest,
  resetPassword
);


router.get('/verify-email/:token', verifyEmail);


router.post('/resend-verification', protect, resendVerification);


router.post('/refresh-token', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token refresh endpoint',
  });
});


module.exports = router;