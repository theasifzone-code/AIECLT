// src/controllers/notificationController.js - ✅ FINAL FIXED
const Notification = require('../models/Notification');
const User = require('../models/User');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');

// ==================== ADMIN / BOARD OFFICIAL FUNCTIONS ====================

/**
 * @desc    Send a notification (Admin/Board Official)
 * @route   POST /api/admin/notifications
 * @access  Private (Admin/Board Official)
 */
const sendNotification = catchAsync(async (req, res) => {
  const { title, message, targetRole, targetUserIds, type, priority, expiryDate, scheduledAt, link } = req.body;

  // Validation
  if (!title || !message) {
    throw new AppError('Please provide title and message', 400);
  }

  // ✅ SECURITY CHECK: Board Official sirf Students ko hi notification bhej sakta hai
  if (req.user.role === 'board_official') {
    const allowedRoles = ['all', 'students'];
    if (!allowedRoles.includes(targetRole)) {
      throw new AppError('Board Officials can only send notifications to Students or All Users', 403);
    }
  }

  // ✅ Fix: Valid target roles map karein
  const validRoles = ['all', 'students', 'board_official', 'admin'];
  
  let finalTargetRole = targetRole || 'all';
  
  // Agar 'student' (singular) aaye, toh 'students' (plural) mein convert karein
  if (finalTargetRole === 'student') {
    finalTargetRole = 'students';
  }
  
  // Agar invalid role hai, toh default 'all' set karein
  if (!validRoles.includes(finalTargetRole)) {
    finalTargetRole = 'all';
  }

  // Determine target users
  let targetUsers = [];

  if (targetUserIds && targetUserIds.length > 0) {
    // Specific users selected
    targetUsers = targetUserIds;
  } else if (finalTargetRole && finalTargetRole !== 'all') {
    // Get all users with that role
    const users = await User.find({
      role: finalTargetRole,
      isActive: true,
      deletedAt: null,
    }).select('_id');
    targetUsers = users.map((u) => u._id);
  }

  // For 'all', we leave targetUsers empty and let it broadcast
  const notification = await Notification.create({
    title,
    message,
    sentBy: req.user.id,
    targetRole: finalTargetRole,
    targetUsers,
    type: type || 'general',
    priority: priority || 'medium',
    expiryDate: expiryDate || null,
    scheduledAt: scheduledAt || null,
    totalRecipients: targetUsers.length || 0,
    metadata: {
      source: 'admin',
      link: link || '',
    },
  });

  // If scheduled for later, don't set sentAt yet (pre-save hook handles this)
  // Otherwise, the pre-save hook automatically sets sentAt

  logger.info(`Notification sent: "${title}" by ${req.user.email} to ${finalTargetRole}`);

  res.status(201).json({
    success: true,
    notification,
  });
});

/**
 * @desc    Get all notifications (Admin/Board Official)
 * @route   GET /api/admin/notifications
 * @access  Private (Admin/Board Official)
 */
const getAdminNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, type = '', priority = '', isActive = '', status = '' } = req.query;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (isActive !== '') query.isActive = isActive === 'true';
  
  // Filter by scheduled vs sent
  if (status === 'scheduled') {
    query.sentAt = null;
    query.scheduledAt = { $ne: null };
  } else if (status === 'sent') {
    query.sentAt = { $ne: null };
  }

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

/**
 * @desc    Get single notification by ID (Admin/Board Official)
 * @route   GET /api/admin/notifications/:id
 * @access  Private (Admin/Board Official)
 */
const getAdminNotificationById = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('sentBy', 'name email')
    .lean();

  if (!notification || notification.isDeleted) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    notification,
  });
});

/**
 * @desc    Soft delete a notification (Admin/Board Official)
 * @route   DELETE /api/admin/notifications/:id
 * @access  Private (Admin/Board Official)
 */
const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification || notification.isDeleted) {
    throw new AppError('Notification not found', 404);
  }

  await notification.softDelete();

  logger.info(`Notification deleted: "${notification.title}" by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

/**
 * @desc    Update a notification (Admin/Board Official)
 * @route   PUT /api/admin/notifications/:id
 * @access  Private (Admin/Board Official)
 */
const updateNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification || notification.isDeleted) {
    throw new AppError('Notification not found', 404);
  }

  const updateData = {};
  if (req.body.title) updateData.title = req.body.title;
  if (req.body.message) updateData.message = req.body.message;
  if (req.body.type) updateData.type = req.body.type;
  if (req.body.priority) updateData.priority = req.body.priority;
  if (req.body.expiryDate) updateData.expiryDate = req.body.expiryDate;
  if (req.body.scheduledAt) updateData.scheduledAt = req.body.scheduledAt;
  if (req.body.targetRole) updateData.targetRole = req.body.targetRole;
  if (req.body.targetUsers) updateData.targetUsers = req.body.targetUsers;
  if (req.body.link) {
    updateData.metadata = { ...notification.metadata, link: req.body.link };
  }

  const updatedNotification = await Notification.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  logger.info(`Notification updated: "${updatedNotification.title}" by ${req.user.email}`);

  res.status(200).json({
    success: true,
    notification: updatedNotification,
  });
});

// ==================== USER SIDE FUNCTIONS ====================

/**
 * @desc    Get notifications for logged-in user (Student/Board Official)
 * @route   GET /api/notifications/my
 * @access  Private
 */
const getMyNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  const query = {
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null }, // Only delivered notifications
    $or: [
      { targetRole: 'all' },
      { targetUsers: userId },
    ],
  };

  const [notifications, total] = await Promise.all([
    Notification.find(query)
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

/**
 * @desc    Get unread notification count for logged-in user
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const unreadCount = await Notification.countUnreadForUser(userId);

  res.status(200).json({
    success: true,
    unreadCount,
  });
});

/**
 * @desc    Mark a notification as read by logged-in user
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification || notification.isDeleted) {
    throw new AppError('Notification not found', 404);
  }

  // Check if user has access to this notification
  const hasAccess = 
    notification.targetRole === 'all' || 
    notification.targetUsers.some((u) => u.toString() === req.user.id.toString());

  if (!hasAccess) {
    throw new AppError('You do not have permission to access this notification', 403);
  }

  await notification.markAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});

/**
 * @desc    Mark all notifications as read for logged-in user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Find all unread notifications for this user
  const notifications = await Notification.find({
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: [{ targetRole: 'all' }, { targetUsers: userId }],
    readBy: { $not: { $elemMatch: { userId } } },
  });

  // Mark each as read
  for (const notification of notifications) {
    await notification.markAsRead(userId);
  }

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    count: notifications.length,
  });
});

// ==================== EXPORT ====================
module.exports = {
  // Admin functions
  sendNotification,
  getAdminNotifications,
  getAdminNotificationById,
  deleteNotification,
  updateNotification,

  // User functions
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};