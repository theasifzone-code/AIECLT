// src/controllers/authController.js - ✅ Production Level Code
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} - JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'ai-eclt',
      audience: 'ai-eclt-users',
    }
  );
};

/**
 * Send token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  // Remove password from response
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    country: user.country,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    profileImage: user.profileImage,
  };

  // Set cookie (optional - for production)
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password, role, country, phone } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'student',
    country: country || 'Pakistan',
    phone: phone || '',
    isEmailVerified: false,
  });

  // Send welcome email (async - don't wait)
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to AI-ECLT!',
      template: 'welcome',
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      },
    });
  } catch (emailError) {
    logger.error('Welcome email failed:', emailError);
    // Don't fail registration if email fails
  }

  logger.info(`User registered: ${user.email} (${user.role})`);

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if account is locked
  if (user.isAccountLocked && user.isAccountLocked()) {
    throw new AppError(
      'Account is locked due to too many failed login attempts. Please try again after 30 minutes.',
      401
    );
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact admin.', 401);
  }

  // Check if account is soft deleted
  if (user.isDeleted) {
    throw new AppError('Account has been deleted. Please contact admin.', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment login attempts
    await user.incrementLoginAttempts();
    logger.warn(`Failed login attempt for: ${email}`);
    throw new AppError('Invalid credentials', 401);
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  user.metadata = {
    ...user.metadata,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    lastActive: new Date(),
  };
  await user.save();

  logger.info(`User logged in: ${user.email} (${user.role})`);

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password -resetPasswordToken -resetPasswordExpire');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = catchAsync(async (req, res) => {
  const { name, country, phone, preferences } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (country) updateData.country = country;
  if (phone) updateData.phone = phone;
  if (preferences) updateData.preferences = preferences;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  logger.info(`Profile updated for: ${user.email}`);

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Forgot password - Send reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide an email', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if user exists for security
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save();

  // Send email (async)
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.name,
        resetUrl,
        expiresIn: '10 minutes',
      },
    });

    logger.info(`Password reset email sent to: ${user.email}`);
  } catch (emailError) {
    // Reset token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    throw new AppError('Failed to send reset email. Please try again later.', 500);
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a reset link has been sent.',
  });
});

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new AppError('Please provide a new password', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Hash the token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  logger.info(`Password reset successful for: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please login with your new password.',
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  // Clear cookie if used
  res.clearCookie('token');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  // Find user by verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  logger.info(`Email verified for: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now login.',
  });
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
const resendVerification = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email already verified', 400);
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email',
      template: 'verify-email',
      data: {
        name: user.name,
        verifyUrl,
      },
    });

    logger.info(`Verification email sent to: ${user.email}`);
  } catch (emailError) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    throw new AppError('Failed to send verification email. Please try again later.', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Verification email sent. Please check your inbox.',
  });
});

// ==================== EXPORT ====================
module.exports = {
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
};