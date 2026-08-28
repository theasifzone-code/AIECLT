// src/routes/ocrRoutes.js - ✅ Production Level Code
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const {
  extractCenterCode,
  manualCenterSearch,
  getCentersList,
  getCities,
} = require('../controllers/ocrController');

// ==================== MULTER CONFIGURATION ====================

/**
 * File upload configuration
 */
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 1,
  },
  fileFilter,
});

// ==================== VALIDATION RULES ====================

/**
 * Manual center search validation
 */
const manualSearchValidation = [
  body('centerCode')
    .trim()
    .notEmpty()
    .withMessage('Center code is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('Center code must be 3-10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Center code can only contain letters and numbers')
    .toUpperCase(),
];

/**
 * Get centers list validation
 */
const getCentersListValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search term must be 1-50 characters'),
  
  query('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be 1-50 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// ==================== ERROR HANDLING MIDDLEWARE ====================

/**
 * Multer error handler
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only one file can be uploaded at a time',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please use "image" as the field name',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

// ==================== ROUTES ====================

/**
 * @route   POST /api/ocr/extract-center
 * @desc    Extract center code using OCR
 * @access  Private (Student)
 */
router.post(
  '/extract-center',
  protect,
  (req, res, next) => {
    // Handle file upload with error handling
    upload.single('image')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  (req, res, next) => {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file. Field name should be "image"',
      });
    }
    next();
  },
  extractCenterCode
);

/**
 * @route   POST /api/ocr/manual-center
 * @desc    Manual center code search
 * @access  Private (Student)
 */
router.post(
  '/manual-center',
  protect,
  manualSearchValidation,
  validateRequest,
  manualCenterSearch
);

/**
 * @route   GET /api/ocr/centers
 * @desc    Get all centers for student search
 * @access  Private (Student)
 */
router.get(
  '/centers',
  protect,
  getCentersListValidation,
  validateRequest,
  getCentersList
);

/**
 * @route   GET /api/ocr/cities
 * @desc    Get all cities with centers
 * @access  Private (Student)
 */
router.get(
  '/cities',
  protect,
  getCities
);

/**
 * @route   POST /api/ocr/upload
 * @desc    Upload image for OCR (alternative endpoint)
 * @access  Private (Student)
 */
router.post(
  '/upload',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // This can be used for general image upload
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  }
);

// ==================== EXPORT ====================
module.exports = router;