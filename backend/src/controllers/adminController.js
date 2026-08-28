// src/controllers/adminController.js - ✅ FINAL FIXED CODE
const ExamCenter = require('../models/ExamCenter');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate random password
 * @param {number} length - Password length
 * @returns {string} - Random password
 */
const generateRandomPassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Send credentials email
 */
const sendCredentialsEmail = async (user, password) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  
  await sendEmail({
    email: user.email,
    subject: 'Your AI-ECLT Account Credentials',
    template: 'welcome',
    data: {
      name: user.name,
      email: user.email,
      password: password,
      role: user.role,
      loginUrl,
    },
  });
};

// ==================== EXAM CENTER MANAGEMENT ====================

/**
 * @desc    Get all exam centers
 * @route   GET /api/admin/centers
 * @access  Private (Board Official/Admin)
 */
const getCenters = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, search = '', city = '', isActive } = req.query;

  const query = { deletedAt: null };
  
  // ✅ FIX: Sirf tab filter lagao jab isActive explicitly bheja gaya ho
  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true'; // String ko boolean mein convert karo
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { centerCode: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  const [centers, total] = await Promise.all([
    ExamCenter.find(query)
      .sort({ centerCode: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    ExamCenter.countDocuments(query),
  ]);

  logger.info(`Fetched ${centers.length} centers`);

  res.status(200).json({
    success: true,
    count: centers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    centers,
  });
});

/**
 * @desc    Get single exam center
 * @route   GET /api/admin/centers/:id
 * @access  Private (Board Official/Admin)
 */
const getCenter = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id).lean();

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  res.status(200).json({
    success: true,
    center,
  });
});

/**
 * @desc    Create exam center
 * @route   POST /api/admin/centers
 * @access  Private (Board Official/Admin)
 */
const createCenter = catchAsync(async (req, res) => {
  const { centerCode } = req.body;

  // ✅ FIX: Agar centerCode missing ho toh error de
  if (!centerCode) {
    throw new AppError('Please provide a center code', 400);
  }

  // Check if center already exists
  const existingCenter = await ExamCenter.findOne({
    centerCode: centerCode.toUpperCase(),
  });

  if (existingCenter) {
    throw new AppError('Center with this code already exists', 400);
  }

  const center = await ExamCenter.create({
    ...req.body,
    centerCode: centerCode.toUpperCase(),
    createdBy: req.user.id,
  });

  logger.info(`Center created: ${center.centerCode} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    center,
  });
});

/**
 * @desc    Update exam center
 * @route   PUT /api/admin/centers/:id
 * @access  Private (Board Official/Admin)
 */
const updateCenter = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id);

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  // Check for duplicate centerCode
  if (req.body.centerCode) {
    const existingCenter = await ExamCenter.findOne({
      centerCode: req.body.centerCode.toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (existingCenter) {
      throw new AppError('Center with this code already exists', 400);
    }

    req.body.centerCode = req.body.centerCode.toUpperCase();
  }

  const updatedCenter = await ExamCenter.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  logger.info(`Center updated: ${updatedCenter.centerCode} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    center: updatedCenter,
  });
});

/**
 * @desc    Delete exam center (Soft delete)
 * @route   DELETE /api/admin/centers/:id
 * @access  Private (Board Official/Admin)
 */
const deleteCenter = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id);

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  // Check if center has active schedules
  const schedules = await Schedule.find({
    examCenterId: req.params.id,
    status: { $in: ['upcoming', 'ongoing'] },
    isActive: true,
    deletedAt: null,
  });

  if (schedules.length > 0) {
    throw new AppError(
      `Cannot delete center with ${schedules.length} active schedules. Please cancel or complete schedules first.`,
      400
    );
  }

  // Soft delete
  await center.softDelete();

  logger.info(`Center deleted: ${center.centerCode} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Center deleted successfully',
  });
});

// ==================== SCHEDULE MANAGEMENT ====================

/**
 * @desc    Get all schedules
 * @route   GET /api/admin/schedules
 * @access  Private (Board Official/Admin)
 */
const getSchedules = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    status = '',
    centerId = '',
    startDate = '',
    endDate = '',
  } = req.query;

  const query = { deletedAt: null };

  if (status) query.status = status;
  if (centerId) query.examCenterId = centerId;

  if (startDate || endDate) {
    query.examDate = {};
    if (startDate) query.examDate.$gte = new Date(startDate);
    if (endDate) query.examDate.$lte = new Date(endDate);
  }

  const [schedules, total] = await Promise.all([
    Schedule.find(query)
      .populate('examCenterId', 'name centerCode address city latitude longitude')
      .sort({ examDate: 1, examTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    Schedule.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: schedules.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    schedules,
  });
});

/**
 * @desc    Get schedule by ID
 * @route   GET /api/admin/schedules/:id
 * @access  Private (Board Official/Admin)
 */
const getSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .lean();

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  res.status(200).json({
    success: true,
    schedule,
  });
});

/**
 * @desc    Create schedule
 * @route   POST /api/admin/schedules
 * @access  Private (Board Official/Admin)
 */
const createSchedule = catchAsync(async (req, res) => {
  const { examCenterId, examDate, examTime, subject } = req.body;

  // Check if center exists
  const center = await ExamCenter.findById(examCenterId);
  if (!center || center.deletedAt) {
    throw new AppError('Exam center not found', 404);
  }

  // Check for schedule conflict
  const conflictingSchedule = await Schedule.findOne({
    examCenterId,
    examDate: new Date(examDate),
    status: { $nin: ['cancelled', 'completed'] },
    deletedAt: null,
  });

  if (conflictingSchedule) {
    throw new AppError('Schedule conflict: Center already has an exam on this date', 400);
  }

  const schedule = await Schedule.create({
    examCenterId,
    examDate: new Date(examDate),
    examTime,
    subject,
    subjectCode: req.body.subjectCode || '',
    totalStudents: req.body.totalStudents || 0,
    status: req.body.status || 'upcoming',
    duration: req.body.duration || 180,
    roomNumber: req.body.roomNumber || '',
    invigilators: req.body.invigilators || [],
    notes: req.body.notes || '',
    createdBy: req.user.id,
  });

  logger.info(`Schedule created: ${schedule.subject} at ${center.centerCode} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    schedule,
  });
});

/**
 * @desc    Update schedule
 * @route   PUT /api/admin/schedules/:id
 * @access  Private (Board Official/Admin)
 */
const updateSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  // If examDate is being updated, check for conflicts
  if (req.body.examDate || req.body.examCenterId) {
    const centerId = req.body.examCenterId || schedule.examCenterId;
    const examDate = req.body.examDate || schedule.examDate;

    const conflictingSchedule = await Schedule.findOne({
      examCenterId: centerId,
      examDate: new Date(examDate),
      status: { $nin: ['cancelled', 'completed'] },
      _id: { $ne: req.params.id },
      deletedAt: null,
    });

    if (conflictingSchedule) {
      throw new AppError('Schedule conflict: Center already has an exam on this date', 400);
    }
  }

  const updatedSchedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('examCenterId', 'name centerCode address city');

  logger.info(`Schedule updated: ${updatedSchedule.subject} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    schedule: updatedSchedule,
  });
});

/**
 * @desc    Delete schedule (Soft delete)
 * @route   DELETE /api/admin/schedules/:id
 * @access  Private (Board Official/Admin)
 */
const deleteSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  // Cannot delete completed schedules
  if (schedule.status === 'completed') {
    throw new AppError('Cannot delete a completed schedule', 400);
  }

  await schedule.softDelete();

  logger.info(`Schedule deleted: ${schedule.subject} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully',
  });
});

// ==================== USER MANAGEMENT ====================

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, search = '', role = '', isActive = '' } = req.query;

  const query = { deletedAt: null };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) query.role = role;
  if (isActive !== '') query.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    users,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .lean();

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Create user (Admin only)
 * @route   POST /api/admin/users
 * @access  Private (Admin only)
 */
const createUser = catchAsync(async (req, res) => {
  const { name, email, role, country, phone } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Generate random password
  const password = generateRandomPassword(10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'student',
    country: country || 'Pakistan',
    phone: phone || '',
    isEmailVerified: true, // Admin created users are verified
  });

  // Send credentials email
  await sendCredentialsEmail(user, password);

  logger.info(`User created: ${user.email} (${user.role}) by ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'User created successfully. Credentials sent via email.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country,
      isActive: user.isActive,
    },
  });
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin only)
 */
const updateUser = catchAsync(async (req, res) => {
  const { role, isActive, name, country, phone } = req.body;

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  // Prevent admin from changing their own role
  if (req.params.id === req.user.id && role && role !== user.role) {
    throw new AppError('You cannot change your own role', 403);
  }

  // Prevent deactivating self
  if (req.params.id === req.user.id && isActive === false) {
    throw new AppError('You cannot deactivate your own account', 403);
  }

  const updateData = {};
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (name) updateData.name = name;
  if (country) updateData.country = country;
  if (phone) updateData.phone = phone;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password -resetPasswordToken -resetPasswordExpire');

  logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

/**
 * @desc    Delete user (Admin only) - Soft delete
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting self
  if (req.params.id === req.user.id) {
    throw new AppError('You cannot delete your own account', 403);
  }

  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', deletedAt: null });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last admin user', 400);
    }
  }

  await user.softDelete();

  logger.info(`User deleted: ${user.email} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// ==================== NOTIFICATION MANAGEMENT ====================

/**
 * @desc    Send notification
 * @route   POST /api/admin/notifications
 * @access  Private (Board Official/Admin)
 */
const sendNotification = catchAsync(async (req, res) => {
  const { title, message, targetRole, expiryDate, type, priority } = req.body;

  if (!title || !message) {
    throw new AppError('Please provide title and message', 400);
  }

  // Get target users based on role
  let targetUsers = [];
  if (targetRole && targetRole !== 'all') {
    const users = await User.find({
      role: targetRole,
      isActive: true,
      deletedAt: null,
    }).select('_id');
    targetUsers = users.map((u) => u._id);
  }

  const notification = await Notification.create({
    title,
    message,
    sentBy: req.user.id,
    targetRole: targetRole || 'all',
    targetUsers: targetUsers.length > 0 ? targetUsers : [],
    totalRecipients: targetUsers.length || 0,
    expiryDate: expiryDate || null,
    type: type || 'general',
    priority: priority || 'medium',
    sentAt: new Date(),
  });

  logger.info(`Notification sent: "${title}" by ${req.user.email}`);

  res.status(201).json({
    success: true,
    notification,
  });
});

/**
 * @desc    Get all notifications
 * @route   GET /api/admin/notifications
 * @access  Private (Board Official/Admin)
 */
const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, type = '', priority = '' } = req.query;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (priority) query.priority = priority;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('sentBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    Notification.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    notifications,
  });
});

// ==================== DASHBOARD STATS ====================

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getStats = catchAsync(async (req, res) => {
  const [userStats, centerStats, scheduleStats, notificationStats] = await Promise.all([
    User.getStats ? User.getStats() : User.countDocuments({ deletedAt: null }),
    ExamCenter.getStats ? ExamCenter.getStats() : { totalCenters: await ExamCenter.countDocuments({ deletedAt: null }) },
    Schedule.getStats ? Schedule.getStats() : { totalSchedules: await Schedule.countDocuments({ deletedAt: null }) },
    Notification.getStats ? Notification.getStats() : { total: await Notification.countDocuments({ isDeleted: false }) },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      users: userStats,
      centers: centerStats,
      schedules: scheduleStats,
      notifications: notificationStats,
    },
  });
});

// ==================== EXPORT ====================
module.exports = {
  // Center management
  getCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,

  // Schedule management
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,

  // User management
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,

  // Notification management
  sendNotification,
  getNotifications,

  // Dashboard
  getStats,
};