const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      logger.warn(`No token provided: ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .populate('examCenter', 'name centerCode city')
        .populate('assignedCenter', 'name centerCode city');

      if (!user) {
        logger.warn(`User not found for token: ${decoded.id}`);
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      if (user.deletedAt) {
        logger.warn(`Deleted user attempted access: ${user.email}`);
        return res.status(401).json({
          success: false,
          message: 'Account has been deleted. Please contact admin.',
        });
      }
      if (!user.isActive) {
        logger.warn(`Deactivated user attempted access: ${user.email}`);
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact admin.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Role ${req.user.role} tried to access: ${req.method} ${req.originalUrl}`
      );
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }

    return next();
  };
};


const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  return next();
};


const boardOfficial = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role !== 'board_official' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Board official access required',
    });
  }

  if (req.user.role === 'board_official' && !req.user.assignedCenter) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to any center. Please contact admin.',
    });
  }

  return next();
};

const student = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required',
    });
  }

  if (!req.user.examCenter) {
    return res.status(403).json({
      success: false,
      message: 'You are not linked to any exam center. Please contact admin.',
    });
  }

  return next();
};

const checkCenterAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'board_official') {
    if (!req.user.assignedCenter) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to any center',
      });
    }
    const targetCenterId =
      req.params.centerId ||
      req.body.examCenterId ||
      req.body.targetCenter ||
      req.query.centerId ||
      req.query.examCenterId;
    if (
      targetCenterId &&
      targetCenterId.toString() !== req.user.assignedCenter._id?.toString() &&
      targetCenterId.toString() !== req.user.assignedCenter.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your assigned center',
      });
    }
    req.centerFilter = { examCenterId: req.user.assignedCenter._id || req.user.assignedCenter };
    return next();
  }
  if (req.user.role === 'student') {
    if (!req.user.examCenter) {
      return res.status(403).json({
        success: false,
        message: 'You are not linked to any exam center',
      });
    }

    req.centerFilter = { examCenter: req.user.examCenter._id || req.user.examCenter };
    return next();
  }

  return next();
};

const requireApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user.isApproved === false) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval. Please wait for admin confirmation.',
    });
  }

  return next();
};

const checkCenterLinked = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role === 'admin') return next();

  if (req.user.role === 'student' && !req.user.examCenter) {
    return res.status(403).json({
      success: false,
      message: 'You are not linked to any exam center. Please contact admin.',
    });
  }

  if (req.user.role === 'board_official' && !req.user.assignedCenter) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to any center. Please contact admin.',
    });
  }

  return next();
};


const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate('examCenter', 'name centerCode city')
        .populate('assignedCenter', 'name centerCode city');

      if (user && !user.deletedAt && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};


module.exports = {
  protect,
  authorize,
  admin,
  boardOfficial,
  student,
  checkCenterAccess,
  requireApproval,
  checkCenterLinked,
  optionalAuth,
};