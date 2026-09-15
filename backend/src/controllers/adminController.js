const ExamCenter = require('../models/ExamCenter');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

const generateRandomPassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const sendCredentialsEmail = async (user, password, centerName = '') => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  await sendEmail({
    email: user.email,
    subject: 'Your AI-ECLT Account Credentials',
    template: 'welcome',
    data: {
      name: user.name,
      email: user.email,
      password,
      role: user.role,
      centerName,
      loginUrl,
    },
  });
};


const getCenters = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, search = '', city = '', isActive } = req.query;

  const query = { deletedAt: null };

  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true';
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
      .populate('boardOfficial', 'name email phone')
      .sort({ centerCode: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    ExamCenter.countDocuments(query),
  ]);

  const centersWithCounts = await Promise.all(
    centers.map(async (center) => {
      const studentCount = await User.countDocuments({
        role: 'student',
        examCenter: center._id,
        isActive: true,
        deletedAt: null,
      });
      return { ...center, totalStudents: studentCount };
    })
  );

  res.status(200).json({
    success: true,
    count: centers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    centers: centersWithCounts,
  });
});


const getCenter = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id)
    .populate('boardOfficial', 'name email phone profileImage')
    .populate('createdBy', 'name email')
    .lean();

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  const [totalStudents, totalSchedules] = await Promise.all([
    User.countDocuments({
      role: 'student',
      examCenter: center._id,
      isActive: true,
      deletedAt: null,
    }),
    Schedule.countDocuments({
      examCenterId: center._id,
      deletedAt: null,
    }),
  ]);

  res.status(200).json({
    success: true,
    center: {
      ...center,
      totalStudents,
      totalSchedules,
    },
  });
});


const createCenter = catchAsync(async (req, res) => {
  const {
    centerCode,
    name,
    address,
    latitude,
    longitude,
    city,
    state,
    country,
    capacity,
    contactNumber,
    contactEmail,
    facilities,
    boardOfficial,
  } = req.body;

  if (!centerCode) {
    throw new AppError('Please provide a center code', 400);
  }

  const existingCenter = await ExamCenter.findOne({
    centerCode: centerCode.toUpperCase(),
  });

  if (existingCenter) {
    throw new AppError('Center with this code already exists', 400);
  }

  if (boardOfficial) {
    const official = await User.findById(boardOfficial);
    if (!official || official.role !== 'board_official') {
      throw new AppError('Invalid board official', 400);
    }
  }

  const center = await ExamCenter.create({
    centerCode: centerCode.toUpperCase(),
    name,
    address,
    latitude,
    longitude,
    city,
    state: state || '',
    country: country || 'Pakistan',
    capacity: capacity || 100,
    contactNumber: contactNumber || '',
    contactEmail: contactEmail || '',
    facilities: facilities || [],
    boardOfficial: boardOfficial || null,
    createdBy: req.user.id,
  });

  if (boardOfficial) {
    await User.findByIdAndUpdate(boardOfficial, {
      assignedCenter: center._id,
    });
  }

  logger.info(`Center created: ${center.centerCode} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    center,
  });
});


const updateCenter = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id);

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

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

  const previousOfficial = center.boardOfficial;
  const newOfficial = req.body.boardOfficial;

  if (newOfficial !== undefined && previousOfficial?.toString() !== newOfficial) {
    if (newOfficial) {
      const official = await User.findById(newOfficial);
      if (!official || official.role !== 'board_official') {
        throw new AppError('Invalid board official', 400);
      }
      await User.findByIdAndUpdate(newOfficial, {
        assignedCenter: center._id,
      });
    }

    if (previousOfficial) {
      await User.findByIdAndUpdate(previousOfficial, {
        assignedCenter: null,
      });
    }
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
  ).populate('boardOfficial', 'name email phone');

  logger.info(`Center updated: ${updatedCenter.centerCode} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    center: updatedCenter,
  });
});


const deleteCenter = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id);

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  const schedules = await Schedule.find({
    examCenterId: req.params.id,
    status: { $in: ['upcoming', 'ongoing'] },
    isActive: true,
    deletedAt: null,
  });

  if (schedules.length > 0) {
    throw new AppError(
      `Cannot delete center with ${schedules.length} active schedules.`,
      400
    );
  }

  const studentCount = await User.countDocuments({
    role: 'student',
    examCenter: req.params.id,
    isActive: true,
    deletedAt: null,
  });

  if (studentCount > 0) {
    throw new AppError(
      `Cannot delete center with ${studentCount} active students.`,
      400
    );
  }

  if (center.boardOfficial) {
    await User.findByIdAndUpdate(center.boardOfficial, {
      assignedCenter: null,
    });
  }

  await center.softDelete();

  logger.info(`Center deleted: ${center.centerCode} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Center deleted successfully',
  });
});



const assignBoardOfficial = catchAsync(async (req, res) => {
  const { centerId, officialId } = req.body;

  if (!centerId || !officialId) {
    throw new AppError('Please provide centerId and officialId', 400);
  }

  const [center, official] = await Promise.all([
    ExamCenter.findById(centerId),
    User.findById(officialId),
  ]);

  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  if (!official || official.role !== 'board_official') {
    throw new AppError('Invalid board official', 400);
  }

  if (official.assignedCenter && official.assignedCenter.toString() !== centerId) {
    await ExamCenter.findByIdAndUpdate(official.assignedCenter, {
      boardOfficial: null,
    });
  }

  if (center.boardOfficial && center.boardOfficial.toString() !== officialId) {
    await User.findByIdAndUpdate(center.boardOfficial, {
      assignedCenter: null,
    });
  }

  center.boardOfficial = officialId;
  await center.save();

  official.assignedCenter = centerId;
  await official.save();

  logger.info(`Official ${official.email} assigned to ${center.centerCode}`);

  res.status(200).json({
    success: true,
    message: 'Board official assigned successfully',
    data: { center, official },
  });
});



const getCenterStudents = catchAsync(async (req, res) => {
  const { centerId } = req.params;
  const { page = 1, limit = 50, grade = '', search = '' } = req.query;

  const center = await ExamCenter.findById(centerId);
  if (!center || center.deletedAt) {
    throw new AppError('Center not found', 404);
  }

  const query = {
    role: 'student',
    examCenter: centerId,
    deletedAt: null,
  };

  if (grade) query.grade = grade;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const [students, total] = await Promise.all([
    User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ rollNumber: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    students,
  });
});


const getSchedules = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    status = '',
    centerId = '',
    grade = '',
    startDate = '',
    endDate = '',
  } = req.query;

  const query = { deletedAt: null };

  if (status) query.status = status;
  if (centerId) query.examCenterId = centerId;
  if (grade) query.grade = grade;

  if (startDate || endDate) {
    query.examDate = {};
    if (startDate) query.examDate.$gte = new Date(startDate);
    if (endDate) query.examDate.$lte = new Date(endDate);
  }

  const [schedules, total] = await Promise.all([
    Schedule.find(query)
      .populate('examCenterId', 'name centerCode address city latitude longitude')
      .populate('students', 'name rollNumber email')
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


const getSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .populate('students', 'name rollNumber email grade')
    .populate('createdBy', 'name email')
    .lean();

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  res.status(200).json({
    success: true,
    schedule,
  });
});


const createSchedule = catchAsync(async (req, res) => {
  const {
    examCenterId,
    examDate,
    examTime,
    subject,
    subjectCode,
    grade,
    totalStudents,
    duration,
    roomNumber,
    invigilators,
    notes,
    students,
  } = req.body;

  const center = await ExamCenter.findById(examCenterId);
  if (!center || center.deletedAt) {
    throw new AppError('Exam center not found', 404);
  }

  const conflictQuery = {
    examCenterId,
    examDate: new Date(examDate),
    subject,
    status: { $nin: ['cancelled', 'completed'] },
    deletedAt: null,
  };
  if (grade) conflictQuery.grade = grade;

  const conflictingSchedule = await Schedule.findOne(conflictQuery);

  if (conflictingSchedule) {
    throw new AppError(
      'Schedule conflict: Center already has an exam on this date for this subject/grade',
      400
    );
  }

  const schedule = await Schedule.create({
    examCenterId,
    examDate: new Date(examDate),
    examTime,
    subject,
    subjectCode: subjectCode || '',
    grade: grade || null,
    students: students || [],
    totalStudents: totalStudents || 0,
    registeredStudents: students?.length || 0,
    status: 'upcoming',
    duration: duration || 180,
    roomNumber: roomNumber || '',
    invigilators: invigilators || [],
    notes: notes || '',
    createdBy: req.user.id,
  });

  logger.info(`Schedule created: ${schedule.subject} at ${center.centerCode}`);

  res.status(201).json({
    success: true,
    schedule,
  });
});


const updateSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  const updateData = { ...req.body };
  updateData.updatedBy = req.user.id;

  if (updateData.examDate) {
    updateData.examDate = new Date(updateData.examDate);
  }

  if (updateData.examDate || updateData.examCenterId) {
    const centerId = updateData.examCenterId || schedule.examCenterId;
    const examDate = updateData.examDate || schedule.examDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(examDate) >= today) {
      const conflictingSchedule = await Schedule.findOne({
        examCenterId: centerId,
        examDate: examDate,
        status: { $nin: ['cancelled', 'completed'] },
        _id: { $ne: req.params.id },
        deletedAt: null,
      });

      if (conflictingSchedule) {
        throw new AppError('Schedule conflict', 400);
      }
    }
  }

  const updatedSchedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: false,
    }
  ).populate('examCenterId', 'name centerCode address city');

  logger.info(`Schedule updated: ${updatedSchedule.subject} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    schedule: updatedSchedule,
  });
});


const deleteSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

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


const getUsers = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    role = '',
    isActive = '',
    centerId = '',
    grade = '',
  } = req.query;

  const query = { deletedAt: null };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) query.role = role;
  if (isActive !== '') query.isActive = isActive === 'true';
  if (centerId) query.examCenter = centerId;
  if (grade) query.grade = grade;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('examCenter', 'name centerCode city')
      .populate('assignedCenter', 'name centerCode city')
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


const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .populate('examCenter', 'name centerCode city address')
    .populate('assignedCenter', 'name centerCode city address')
    .populate('registeredSchedules', 'subject examDate status')
    .lean();

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

const createUser = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password: userPassword,
    role,
    country,
    phone,
    city,
    examCenter,
    assignedCenter,
    rollNumber,
    grade,
    board,
    dateOfBirth,
  } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }
  if (role === 'student' && examCenter) {
    const center = await ExamCenter.findById(examCenter);
    if (!center || center.deletedAt) {
      throw new AppError('Exam center not found', 404);
    }
  }
  if (role === 'student' && examCenter && rollNumber) {
    const duplicate = await User.findOne({
      role: 'student',
      examCenter,
      rollNumber: rollNumber.toUpperCase(),
      deletedAt: null,
    });
    if (duplicate) {
      throw new AppError('This roll number already exists at this center', 400);
    }
  }
  const finalPassword = userPassword || generateRandomPassword(10);
  const isAdminProvided = !!userPassword;

  const userData = {
    name,
    email: email.toLowerCase(),
    password: finalPassword,
    role: role || 'student',
    country: country || 'Pakistan',
    phone: phone || '',
    city: city || '',
    isEmailVerified: true,
    createdBy: req.user.id,
  };

  if (role === 'student') {
    userData.examCenter = examCenter || null;
    userData.rollNumber = rollNumber ? rollNumber.toUpperCase() : null;
    userData.grade = grade || null;
    userData.board = board || '';
    userData.dateOfBirth = dateOfBirth || null;
  }

  if (role === 'board_official') {
    userData.assignedCenter = assignedCenter || null;
  }
  const user = await User.create(userData);
  if (role === 'student' && examCenter) {
    await ExamCenter.findByIdAndUpdate(examCenter, {
      $inc: { totalStudents: 1 },
    });
  }

  if (role === 'board_official' && assignedCenter) {
    await ExamCenter.findByIdAndUpdate(assignedCenter, {
      boardOfficial: user._id,
    });
  }
  let centerName = '';
  if (examCenter || assignedCenter) {
    const center = await ExamCenter.findById(examCenter || assignedCenter);
    centerName = center?.name || '';
  }

  try {
    await sendCredentialsEmail(user, finalPassword, centerName);
  } catch (err) {
    logger.error('Credentials email failed:', err);
  }

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
      examCenter: user.examCenter,
      assignedCenter: user.assignedCenter,
      rollNumber: user.rollNumber,
      grade: user.grade,
      isActive: user.isActive,
    },
  });
});


const updateUser = catchAsync(async (req, res) => {
  const {
    role,
    isActive,
    name,
    country,
    phone,
    city,
    examCenter,
    assignedCenter,
    rollNumber,
    grade,
    board,
    password: newPassword,
  } = req.body;

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  // Self-protection
  if (req.params.id === req.user.id && role && role !== user.role) {
    throw new AppError('You cannot change your own role', 403);
  }

  if (req.params.id === req.user.id && isActive === false) {
    throw new AppError('You cannot deactivate your own account', 403);
  }

  const updateData = {};
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (name) updateData.name = name;
  if (country) updateData.country = country;
  if (phone) updateData.phone = phone;
  if (city) updateData.city = city;

  if (newPassword && newPassword.length >= 6) {
    updateData.password = newPassword;
  }

  if (examCenter !== undefined && user.role === 'student') {
    const oldCenter = user.examCenter;

    if (oldCenter && oldCenter.toString() !== examCenter) {
      await ExamCenter.findByIdAndUpdate(oldCenter, {
        $inc: { totalStudents: -1 },
      });
      if (examCenter) {
        await ExamCenter.findByIdAndUpdate(examCenter, {
          $inc: { totalStudents: 1 },
        });
      }
    } else if (!oldCenter && examCenter) {
      await ExamCenter.findByIdAndUpdate(examCenter, {
        $inc: { totalStudents: 1 },
      });
    }

    updateData.examCenter = examCenter || null;
  }


  if (assignedCenter !== undefined && user.role === 'board_official') {
    const oldCenter = user.assignedCenter;

    if (oldCenter && oldCenter.toString() !== assignedCenter) {
      await ExamCenter.findByIdAndUpdate(oldCenter, {
        boardOfficial: null,
      });
    }

    if (assignedCenter) {
      await ExamCenter.findByIdAndUpdate(assignedCenter, {
        boardOfficial: user._id,
      });
    }

    updateData.assignedCenter = assignedCenter || null;
  }

  if (rollNumber !== undefined) {
    updateData.rollNumber = rollNumber ? rollNumber.toUpperCase() : null;
  }
  if (grade !== undefined) updateData.grade = grade;
  if (board !== undefined) updateData.board = board;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .populate('examCenter', 'name centerCode city')
    .populate('assignedCenter', 'name centerCode city');

  logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});


const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  if (req.params.id === req.user.id) {
    throw new AppError('You cannot delete your own account', 403);
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({
      role: 'admin',
      deletedAt: null,
    });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last admin user', 400);
    }
  }

  if (user.role === 'student' && user.examCenter) {
    await ExamCenter.findByIdAndUpdate(user.examCenter, {
      $inc: { totalStudents: -1 },
    });
  }

  if (user.role === 'board_official' && user.assignedCenter) {
    await ExamCenter.findByIdAndUpdate(user.assignedCenter, {
      boardOfficial: null,
    });
  }

  await user.softDelete();

  logger.info(`User deleted: ${user.email} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});



const sendNotification = catchAsync(async (req, res) => {
  const {
    title,
    message,
    targetRole,
    targetCenter,
    targetGrade,
    targetUsers: manualUserIds,
    expiryDate,
    type,
    priority,
  } = req.body;

  if (!title || !message) {
    throw new AppError('Please provide title and message', 400);
  }

  let targetUsers = manualUserIds || [];

  if (targetUsers.length === 0 && targetRole && targetRole !== 'all') {
    const userQuery = {
      role: targetRole,
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
    targetRole: targetRole || 'all',
    targetCenter: targetCenter || null,
    targetGrade: targetGrade || null,
    targetUsers,
    totalRecipients: targetUsers.length || 0,
    expiryDate: expiryDate || null,
    type: type || 'general',
    priority: priority || 'medium',
    sentAt: new Date(),
  });

  logger.info(
    `Notification sent: "${title}" → ${targetUsers.length} users by ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    notification,
  });
});


const getNotifications = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    type = '',
    priority = '',
    centerId = '',
  } = req.query;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (centerId) query.targetCenter = centerId;

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



const getStats = catchAsync(async (req, res) => {
  const [userStats, centerStats, scheduleStats, notificationStats] =
    await Promise.all([
      User.getStats ? User.getStats() : User.countDocuments({ deletedAt: null }),
      ExamCenter.getStats
        ? ExamCenter.getStats()
        : { totalCenters: await ExamCenter.countDocuments({ deletedAt: null }) },
      Schedule.getStats
        ? Schedule.getStats()
        : { totalSchedules: await Schedule.countDocuments({ deletedAt: null }) },
      Notification.getStats
        ? Notification.getStats()
        : { total: await Notification.countDocuments({ isDeleted: false }) },
    ]);

  const topCenters = await ExamCenter.aggregate([
    { $match: { deletedAt: null } },
    {
      $lookup: {
        from: 'users',
        let: { centerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$examCenter', '$$centerId'] },
              role: 'student',
              deletedAt: null,
            },
          },
          { $count: 'count' },
        ],
        as: 'studentCount',
      },
    },
    {
      $project: {
        name: 1,
        centerCode: 1,
        city: 1,
        totalStudents: { $ifNull: [{ $arrayElemAt: ['$studentCount.count', 0] }, 0] },
      },
    },
    { $sort: { totalStudents: -1 } },
    { $limit: 5 },
  ]);

  const usersByRole = await User.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      users: userStats,
      usersByRole,
      centers: centerStats,
      schedules: scheduleStats,
      notifications: notificationStats,
      topCenters,
    },
  });
});


module.exports = {
  getCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
  assignBoardOfficial,
  getCenterStudents,
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  sendNotification,
  getNotifications,
  getStats,
};