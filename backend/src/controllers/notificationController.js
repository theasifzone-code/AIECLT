const Notification = require('../models/Notification');
const User = require('../models/User');
const ExamCenter = require('../models/ExamCenter');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');

const buildUserNotificationQuery = (user) => {
  const orConditions = [
    { targetUsers: user._id },
  ];
  orConditions.push({
    targetUsers: { $size: 0 },
    targetCenter: null,
    targetRole: 'all',
  });
  const roleTarget =
    user.role === 'student'
      ? 'students'
      : user.role === 'board_official'
        ? 'board_official'
        : 'admin';

  orConditions.push({
    targetUsers: { $size: 0 },
    targetCenter: null,
    targetRole: roleTarget,
  });
  const userCenter =
    user.role === 'student' ? user.examCenter : user.assignedCenter;

  if (userCenter) {
    orConditions.push({
      targetUsers: { $size: 0 },
      targetCenter: userCenter,
      targetRole: roleTarget,
      targetGrade: null,
    });

    if (user.role === 'student' && user.grade) {
      orConditions.push({
        targetUsers: { $size: 0 },
        targetCenter: userCenter,
        targetRole: 'students',
        targetGrade: user.grade,
      });
    }
  }

  return {
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: orConditions,
  };
};



const sendNotification = catchAsync(async (req, res) => {
  const {
    title,
    message,
    targetRole,
    targetCenter,
    targetGrade,
    targetUserIds,
    type,
    priority,
    expiryDate,
    scheduledAt,
    link,
  } = req.body;

  if (!title || !message) {
    throw new AppError('Please provide title and message', 400);
  }

  const validRoles = ['all', 'students', 'board_official', 'admin'];
  let finalTargetRole = targetRole || 'all';
  if (finalTargetRole === 'student') finalTargetRole = 'students';
  if (!validRoles.includes(finalTargetRole)) finalTargetRole = 'all';

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (!official?.assignedCenter) {
      throw new AppError('You are not assigned to any center', 403);
    }

    if (!['all', 'students'].includes(finalTargetRole)) {
      throw new AppError(
        'Board Officials can only send notifications to students',
        403
      );
    }
    if (targetCenter && targetCenter.toString() !== official.assignedCenter.toString()) {
      throw new AppError('You can only send notifications to your own center', 403);
    }
  }

  let targetUsers = targetUserIds || [];

  if (targetUsers.length === 0 && finalTargetRole !== 'all') {
    const userQuery = {
      role: finalTargetRole,
      isActive: true,
      deletedAt: null,
    };

    if (targetCenter) userQuery.examCenter = targetCenter;
    if (targetGrade) userQuery.grade = targetGrade;

    const users = await User.find(userQuery).select('_id');
    targetUsers = users.map((u) => u._id);
  }

  const notification = await Notification.create({
    title,
    message,
    sentBy: req.user.id,
    targetRole: finalTargetRole,
    targetCenter: targetCenter || null,
    targetGrade: targetGrade || null,
    targetUsers,
    type: type || 'general',
    priority: priority || 'medium',
    expiryDate: expiryDate || null,
    scheduledAt: scheduledAt || null,
    sentAt: scheduledAt ? null : new Date(),
    totalRecipients: targetUsers.length || 0,
    metadata: {
      source: req.user.role === 'admin' ? 'admin' : 'board_official',
      link: link || '',
    },
  });

  logger.info(
    `Notification sent: "${title}" by ${req.user.email} to ${finalTargetRole} (${targetUsers.length} users)`
  );

  res.status(201).json({
    success: true,
    notification,
  });
});


const getAdminNotifications = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    type = '',
    priority = '',
    isActive = '',
    status = '',
    centerId = '',
  } = req.query;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (isActive !== '') query.isActive = isActive === 'true';
  if (centerId) query.targetCenter = centerId;

  if (status === 'scheduled') {
    query.sentAt = null;
    query.scheduledAt = { $ne: null };
  } else if (status === 'sent') {
    query.sentAt = { $ne: null };
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter) {
      query.$or = [
        { targetCenter: official.assignedCenter },
        { sentBy: req.user.id },
      ];
    }
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('sentBy', 'name email role')
      .populate('targetCenter', 'name centerCode city')
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
    .populate('sentBy', 'name email role')
    .populate('targetCenter', 'name centerCode city')
    .lean();

  if (!notification || notification.isDeleted) {
    throw new AppError('Notification not found', 404);
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    const notificationCenter = notification.targetCenter?._id?.toString();
    const officialCenter = official?.assignedCenter?.toString();

    if (
      notification.sentBy?._id?.toString() !== req.user.id &&
      notificationCenter !== officialCenter
    ) {
      throw new AppError('Access denied', 403);
    }
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

  if (
    req.user.role !== 'admin' &&
    notification.sentBy.toString() !== req.user.id
  ) {
    throw new AppError('You can only delete your own notifications', 403);
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
  if (
    req.user.role !== 'admin' &&
    notification.sentBy.toString() !== req.user.id
  ) {
    throw new AppError('You can only update your own notifications', 403);
  }

  const updateData = {};
  if (req.body.title) updateData.title = req.body.title;
  if (req.body.message) updateData.message = req.body.message;
  if (req.body.type) updateData.type = req.body.type;
  if (req.body.priority) updateData.priority = req.body.priority;
  if (req.body.expiryDate) updateData.expiryDate = req.body.expiryDate;
  if (req.body.scheduledAt) updateData.scheduledAt = req.body.scheduledAt;
  if (req.body.targetRole) updateData.targetRole = req.body.targetRole;
  if (req.body.targetGrade !== undefined) updateData.targetGrade = req.body.targetGrade;
  if (req.body.targetCenter !== undefined) updateData.targetCenter = req.body.targetCenter;
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
  const user = await User.findById(req.user.id).select(
    'role examCenter assignedCenter grade'
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const query = buildUserNotificationQuery(user);

  logger.info(`Fetching notifications for user: ${user._id} (${user.role})`);

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('sentBy', 'name role')
      .populate('targetCenter', 'name centerCode city')
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


const getUnreadCount = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    'role examCenter assignedCenter grade'
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }
  const query = buildUserNotificationQuery(user);
  query.readBy = { $not: { $elemMatch: { userId: user._id } } };

  const unreadCount = await Notification.countDocuments(query);

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
  const user = await User.findById(req.user.id).select(
    'role examCenter assignedCenter grade'
  );

  const accessQuery = buildUserNotificationQuery(user);
  accessQuery._id = notification._id;

  const hasAccess = await Notification.exists(accessQuery);

  if (!hasAccess) {
    throw new AppError('You do not have access to this notification', 403);
  }

  await notification.markAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});



const markAllAsRead = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    'role examCenter assignedCenter grade'
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const query = buildUserNotificationQuery(user);
  query.readBy = { $not: { $elemMatch: { userId: user._id } } };

  const notifications = await Notification.find(query);

  for (const notification of notifications) {
    await notification.markAsRead(user._id);
  }

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    count: notifications.length,
  });
});


module.exports = {
  sendNotification,
  getAdminNotifications,
  getAdminNotificationById,
  deleteNotification,
  updateNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};