// src/middleware/auth.js - ✅ COMPLETE FIXED VERSION

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Protect middleware - CORRECT VERSION
const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // ❌ If no token
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    try {
      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.id);

      // ✅ Get user from database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // ✅ Attach user to request
      req.user = user;
      
      // ✅ IMPORTANT: Call next() to continue
      return next();

    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

// ✅ Authorize middleware - Check roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }

    return next();
  };
};

// ✅ Admin middleware - Shortcut
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  return next();
};

// ✅ Board Official middleware
const boardOfficial = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'board_official' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Board official access required'
    });
  }

  return next();
};

console.log('✅ auth.js middleware loaded');
console.log('  - protect:', typeof protect);
console.log('  - authorize:', typeof authorize);
console.log('  - admin:', typeof admin);
console.log('  - boardOfficial:', typeof boardOfficial);

module.exports = {
  protect,
  authorize,
  admin,
  boardOfficial
};