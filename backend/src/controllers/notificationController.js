
const Notification = require('../models/Notification');
const User = require('../models/User');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');


const sendNotification = catchAsync(async (req, res) => {
  const { title, message, targetRole, targetUserIds, type, priority, expiryDate, scheduledAt, link } = req.body;

  // Validation
  if (!title || !message) {
    throw new AppError('Please provide title and message', 400);
  }

  if (req.user.role === 'board_official') {
    const allowedRoles = ['all', 'students'];
    if (!allowedRoles.includes(targetRole)) {
      throw new AppError('Board Officials can only send notifications to Students or All Users', 403);
    }
  }

 
  const validRoles = ['all', 'students', 'board_official', 'admin'];
  
  let finalTargetRole = targetRole || 'all';
  
  if (finalTargetRole === 'student') {
    finalTargetRole = 'students';
  }
  
  if (!validRoles.includes(finalTargetRole)) {
    finalTargetRole = 'all';
  }

  let targetUsers = [];

  if (targetUserIds && targetUserIds.length > 0) {

    targetUsers = targetUserIds;
  } else if (finalTargetRole && finalTargetRole !== 'all') {
    const users = await User.find({
      role: finalTargetRole,
      isActive: true,
      deletedAt: null,
    }).select('_id');
    targetUsers = users.map((u) => u._id);
  }

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

  logger.info(`Notification sent: "${title}" by ${req.user.email} to ${finalTargetRole}`);

  res.status(201).json({
    success: true,
    notification,
  });
});


const getAdminNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, type = '', priority = '', isActive = '', status = '' } = req.query;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (isActive !== '') query.isActive = isActive === 'true';
  
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



const getMyNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  console.log('Fetching notifications for user:', userId);

  const query = {
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: [
      { targetRole: 'all' },
      { targetRole: 'students' }, 
      { targetUsers: userId },
      { targetUsers: { $in: [userId] } }, 
    ],
  };

  console.log('Query:', JSON.stringify(query, null, 2));

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    Notification.countDocuments(query),
  ]);

  console.log(`Found ${notifications.length} notifications`);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    notifications,
  });
});


const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const unreadCount = await Notification.countDocuments({
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: [
      { targetRole: 'all' },
      { targetRole: 'students' },
      { targetUsers: userId },
      { targetUsers: { $in: [userId] } },
    ],
    readBy: { $not: { $elemMatch: { userId } } },
  });

  res.status(200).json({
    success: true,
    unreadCount,
  });
});


const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification || notification.isDeleted) {
    throw new AppError('Notification not found', 404);
  }

  const hasAccess = 
    notification.targetRole === 'all' || 
    notification.targetRole === 'students' || 
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


const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const notifications = await Notification.find({
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: [
      { targetRole: 'all' },
      { targetRole: 'students' }, 
      { targetUsers: userId },
      { targetUsers: { $in: [userId] } },
    ],
    readBy: { $not: { $elemMatch: { userId } } },
  });

  for (const notification of notifications) {
    await notification.markAsRead(userId);
  }

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    count: notifications.length,
  });
});


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