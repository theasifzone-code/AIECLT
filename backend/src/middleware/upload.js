
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/errorUtils');
const logger = require('../utils/logger');




const UPLOAD_CONFIG = {
  maxFileSize: {
    image: 5 * 1024 * 1024, 
    document: 10 * 1024 * 1024, 
    video: 50 * 1024 * 1024, 
  },
  
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



const ensureDirectoryExists = (dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.info(`📁 Created directory: ${dir}`);
  }
};


const generateFilename = (file) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname);
  const basename = path.basename(file.originalname, extension)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-');
  
  return `${basename}-${timestamp}-${random}${extension}`;
};


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


const memoryStorage = multer.memoryStorage();



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


const uploadSingleImage = (fieldName = 'image') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: imageFilter,
  }).single(fieldName);
};


const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: imageFilter,
  }).array(fieldName, maxCount);
};


const uploadSingleDocument = (fieldName = 'document') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: documentFilter,
  }).single(fieldName);
};


const uploadImageToMemory = (fieldName = 'image') => {
  return multer({
    storage: memoryStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: imageFilter,
  }).single(fieldName);
};


const uploadAnyFile = (fieldName = 'file') => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: allFilesFilter,
  }).single(fieldName);
};


const uploadMultipleFiles = (fieldName = 'files', maxCount = 10) => {
  return multer({
    storage: diskStorage,
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: allFilesFilter,
  }).array(fieldName, maxCount);
};


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
        

        if (err.statusCode === 400) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        next(err);
      }
      
      next();
    });
  };
};

module.exports = {
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