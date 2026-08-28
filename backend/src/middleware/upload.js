// src/middleware/upload.js - ✅ Production Level Code
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/errorUtils');
const logger = require('../utils/logger');

// ==================== CONSTANTS ====================

/**
 * File upload configuration
 */
const UPLOAD_CONFIG = {
  // File size limits
  maxFileSize: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
  },
  
  // Allowed MIME types
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    all: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'application/pdf'],
  },
  
  // Upload directories
  uploadDir: {
    profile: 'uploads/profiles',
    centers: 'uploads/centers',
    documents: 'uploads/documents',
    temp: 'uploads/temp',
    ocr: 'uploads/ocr',
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Ensure upload directory exists
 * @param {string} dir - Directory path
 */
const ensureDirectoryExists = (dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.info(`📁 Created directory: ${dir}`);
  }
};

/**
 * Generate unique filename
 * @param {Object} file - Multer file object
 * @returns {string} - Unique filename
 */
const generateFilename = (file) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname);
  const basename = path.basename(file.originalname, extension)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-');
  
  return `${basename}-${timestamp}-${random}${extension}`;
};

// ==================== STORAGE CONFIGURATIONS ====================

/**
 * Disk storage configuration
 */
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_CONFIG.uploadDir.temp;
    
    // Determine upload path based on field name or route
    if (file.fieldname === 'profileImage' || file.fieldname === 'avatar') {
      uploadPath = UPLOAD_CONFIG.uploadDir.profile;
    } else if (file.fieldname === 'centerImage' || file.fieldname === 'centerPhoto') {
      uploadPath = UPLOAD_CONFIG.uploadDir.centers;
    } else if (file.fieldname === 'document' || file.fieldname === 'file') {
      uploadPath = UPLOAD_CONFIG.uploadDir.documents;
    } else if (file.fieldname === 'image' || file.fieldname === 'ocrImage') {
      uploadPath = UPLOAD_CONFIG.uploadDir.ocr;
    }
    
    // Ensure directory exists
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file);
    cb(null, filename);
  },
});

/**
 * Memory storage configuration (for OCR)
 */
const memoryStorage = multer.memoryStorage();

// ==================== FILE FILTERS ====================

/**
 * Image file filter
 */
const imageFilter = (req, file, cb) => {
  if (UPLOAD_CONFIG.allowedMimeTypes.image.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedMimeTypes.image.join(', ')}`,
        400
      ),
      false
    );
  }
};

/**
 * Document file filter
 */
const documentFilter = (req, file, cb) => {
  if (UPLOAD_CONFIG.allowedMimeTypes.document.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedMimeTypes.document.join(', ')}`,
        400
      ),
      false
    );
  }
};

/**
 * All files filter
 */
const allFilesFilter = (req, file, cb) => {
  if (UPLOAD_CONFIG.allowedMimeTypes.all.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedMimeTypes.all.join(', ')}`,
        400
      ),
      false
    );
  }
};

// ==================== MULTER INSTANCES ====================

/**
 * Upload single image (disk storage)
 */
const uploadSingleImage = (fieldName = 'image') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: imageFilter,
  }).single(fieldName);
};

/**
 * Upload multiple images (disk storage)
 */
const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: imageFilter,
  }).array(fieldName, maxCount);
};

/**
 * Upload single document (disk storage)
 */
const uploadSingleDocument = (fieldName = 'document') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: documentFilter,
  }).single(fieldName);
};

/**
 * Upload image to memory (for OCR)
 */
const uploadImageToMemory = (fieldName = 'image') => {
  return multer({
    storage: memoryStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: imageFilter,
  }).single(fieldName);
};

/**
 * Upload any file to disk
 */
const uploadAnyFile = (fieldName = 'file') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: allFilesFilter,
  }).single(fieldName);
};

/**
 * Upload multiple files (any type)
 */
const uploadMultipleFiles = (fieldName = 'files', maxCount = 10) => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: allFilesFilter,
  }).array(fieldName, maxCount);
};

// ==================== MIDDLEWARE WRAPPER ====================

/**
 * Wrapper for multer middleware with error handling
 * @param {Function} uploadMiddleware - Multer middleware
 * @returns {Function} - Express middleware with error handling
 */
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        // Multer error handling
        if (err instanceof multer.MulterError) {
          if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
              success: false,
              message: `File too large. Maximum size is ${UPLOAD_CONFIG.maxFileSize.image / (1024 * 1024)}MB`,
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files uploaded',
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: `Unexpected file field. Expected: ${err.field}`,
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }
        
        // Custom error handling
        if (err.statusCode === 400) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        
        // Pass to global error handler
        next(err);
      }
      
      next();
    });
  };
};

// ==================== EXPORT ====================
module.exports = {
  // Storage configs
  diskStorage,
  memoryStorage,
  
  // Filters
  imageFilter,
  documentFilter,
  allFilesFilter,
  
  // Multer instances
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleDocument,
  uploadImageToMemory,
  uploadAnyFile,
  uploadMultipleFiles,
  
  // Wrapper
  handleUpload,
  
  // Constants
  UPLOAD_CONFIG,
  generateFilename,
  ensureDirectoryExists,
};