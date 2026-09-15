const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, query, param, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');

const {
  extractCenterCode,
  manualCenterSearch,
  getCentersList,
  getCities,
  getCenterById,
  getNearbyCenters,
} = require('../controllers/ocrController');

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


const FILE_SIZE_LIMIT = 5 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
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


const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${
          FILE_SIZE_LIMIT / (1024 * 1024)
        }MB`,
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

const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
};



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

const getCentersListValidation = [
  query('search')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search term must be 1-50 characters'),

  query('city')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be 1-50 characters'),

  query('page')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be between 1 and 500'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid center ID'),
];

const nearbyValidation = [
  query('lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),

  query('lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('maxDistance')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0.1, max: 500 })
    .withMessage('maxDistance must be 0.1-500 km'),
  query('limit')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be 1-50'),
];
router.get('/cities', getCities);
router.get(
  '/centers',
  getCentersListValidation,
  validateRequest,
  getCentersList
);

router.get(
  '/centers/:id',
  idValidation,
  validateRequest,
  getCenterById
);

router.get(
  '/centers/nearby/search',
  nearbyValidation,
  validateRequest,
  getNearbyCenters
);

router.use(protect);
router.post(
  '/extract-center',
  uploadMiddleware,
  (req, res, next) => {
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


router.post(
  '/manual-center',
  manualSearchValidation,
  validateRequest,
  manualCenterSearch
);


module.exports = router;