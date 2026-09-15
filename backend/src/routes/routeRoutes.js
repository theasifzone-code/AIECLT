const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');

const {
  getRoute,
  getETA,
  getNearbyCenters,
  geocodeAddress,
  getRouteToCenter,
  getMultiCenterRoute,
} = require('../controllers/routeController');

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

const coordsValidation = [
  body('originLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid origin latitude'),
  body('originLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid origin longitude'),
  body('destLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid destination latitude'),
  body('destLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid destination longitude'),
  body('unit')
    .optional()
    .isIn(['km', 'miles']).withMessage('Unit must be km or miles'),
];

const routeToCenterValidation = [
  body('originLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid origin latitude'),
  body('originLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid origin longitude'),
  body('centerId')
    .isMongoId().withMessage('Invalid center ID'),
  body('unit')
    .optional()
    .isIn(['km', 'miles']).withMessage('Unit must be km or miles'),
];

const multiCenterValidation = [
  body('originLat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid origin latitude'),
  body('originLng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid origin longitude'),
  body('centerIds')
    .isArray({ min: 1, max: 5 }).withMessage('Provide 1-5 center IDs'),
  body('centerIds.*')
    .isMongoId().withMessage('Invalid center ID format'),
  body('unit')
    .optional()
    .isIn(['km', 'miles']).withMessage('Unit must be km or miles'),
];

const nearbyValidation = [
  body('lat')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('radius')
    .optional()
    .isFloat({ min: 0.1, max: 500 }).withMessage('Radius must be 0.1-500'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  body('unit')
    .optional()
    .isIn(['km', 'miles']).withMessage('Unit must be km or miles'),
];

const geocodeValidation = [
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 3, max: 200 }).withMessage('Address must be 3-200 characters'),
];

router.use(protect);

router.post('/get-route', coordsValidation, validateRequest, getRoute);
router.post('/get-eta', coordsValidation, validateRequest, getETA);
router.post(
  '/to-center',
  routeToCenterValidation,
  validateRequest,
  getRouteToCenter
);

router.post(
  '/multi-center',
  multiCenterValidation,
  validateRequest,
  getMultiCenterRoute
);

router.post(
  '/nearby-centers',
  nearbyValidation,
  validateRequest,
  getNearbyCenters
);

router.post(
  '/geocode',
  geocodeValidation,
  validateRequest,
  geocodeAddress
);


module.exports = router;