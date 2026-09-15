const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ExamCenter = require('../models/ExamCenter');
const { sendEmail } = require('../utils/email');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');



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



const buildUserResponse = (user) => {
  const response = {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    country: user.country,
    phone: user.phone,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isApproved: user.isApproved,
    profileImage: user.profileImage,
    city: user.city,
    preferences: user.preferences,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };

  if (user.role === 'student') {
    response.examCenter = user.examCenter;
    response.rollNumber = user.rollNumber;
    response.registrationNumber = user.registrationNumber;
    response.grade = user.grade;
    response.board = user.board;
    response.dateOfBirth = user.dateOfBirth;
    response.registeredSchedules = user.registeredSchedules;
  }

  if (user.role === 'board_official') {
    response.assignedCenter = user.assignedCenter;
  }

  if (user.examCenter && typeof user.examCenter === 'object' && user.examCenter.name) {
    response.centerInfo = user.examCenter;
  }

  return response;
};



const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  const userResponse = buildUserResponse(user);

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



const register = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    country,
    phone,
    city,
    examCenter,
    rollNumber,
    grade,
    board,
    dateOfBirth,
  } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  if (role === 'student' && examCenter) {
    const centerExists = await ExamCenter.findById(examCenter);
    if (!centerExists) {
      throw new AppError('Exam center not found', 404);
    }
  }

  if (role === 'student' && examCenter && rollNumber) {
    const duplicate = await User.findOne({
      role: 'student',
      examCenter,
      rollNumber: rollNumber.toUpperCase(),
    });
    if (duplicate) {
      throw new AppError('This roll number is already registered at this center', 400);
    }
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'student',
    country: country || 'Pakistan',
    phone: phone || '',
    city: city || '',
    isEmailVerified: false,
    ...(role === 'student' && {
      examCenter: examCenter || null,
      rollNumber: rollNumber ? rollNumber.toUpperCase() : null,
      grade: grade || null,
      board: board || '',
      dateOfBirth: dateOfBirth || null,
    }),
  });

  if (role === 'student' && examCenter) {
    await ExamCenter.findByIdAndUpdate(examCenter, {
      $inc: { totalStudents: 1 },
    });
  }

  // Send welcome email
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
  }

  logger.info(`User registered: ${user.email} (${user.role})`);

  if (user.examCenter) {
    await user.populate('examCenter', 'name centerCode city address latitude longitude');
  }

  sendTokenResponse(user, 201, res);
});


const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('examCenter', 'name centerCode city address latitude longitude')
    .populate('assignedCenter', 'name centerCode city address latitude longitude');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.isAccountLocked && user.isAccountLocked()) {
    throw new AppError(
      'Account is locked due to too many failed login attempts. Please try again after 30 minutes.',
      401
    );
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact admin.', 401);
  }

  if (user.isDeleted) {
    throw new AppError('Account has been deleted. Please contact admin.', 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();
    logger.warn(`Failed login attempt for: ${email}`);
    throw new AppError('Invalid credentials', 401);
  }

  await user.resetLoginAttempts();
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



const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .populate('examCenter', 'name centerCode city address latitude longitude capacity')
    .populate('assignedCenter', 'name centerCode city address latitude longitude')
    .populate('registeredSchedules', 'subject examDate examTime status');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user: buildUserResponse(user),
  });
});



const updateProfile = catchAsync(async (req, res) => {
  const {
    name,
    country,
    phone,
    city,
    preferences,
    grade,
    board,
    dateOfBirth,
    rollNumber,
    registrationNumber,
  } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (country) updateData.country = country;
  if (phone) updateData.phone = phone;
  if (city) updateData.city = city;
  if (preferences) updateData.preferences = preferences;
  if (grade) updateData.grade = grade;
  if (board) updateData.board = board;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (rollNumber) updateData.rollNumber = rollNumber.toUpperCase();
  if (registrationNumber) updateData.registrationNumber = registrationNumber.toUpperCase();

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  )
    .select('-password')
    .populate('examCenter', 'name centerCode city address latitude longitude');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  logger.info(`Profile updated for: ${user.email}`);

  res.status(200).json({
    success: true,
    user: buildUserResponse(user),
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});



const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide an email', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }

  const resetToken = user.generateResetToken();
  await user.save();

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



const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new AppError('Please provide a new password', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

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



const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};


const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

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



const resendVerification = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email already verified', 400);
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

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