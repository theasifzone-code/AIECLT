const Schedule = require('../models/Schedule');
const ExamCenter = require('../models/ExamCenter');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');

const isScheduleAccessibleByStudent = (schedule, student) => {
  const isDirectlyAssigned = schedule.students?.some(
    (id) => id.toString() === student._id.toString()
  );
  if (isDirectlyAssigned) return true;
  const scheduleCenterId = schedule.examCenterId?._id?.toString() || schedule.examCenterId?.toString();
  const studentCenterId = student.examCenter?._id?.toString() || student.examCenter?.toString();
  const sameCenter = scheduleCenterId === studentCenterId;
  const isCenterWide = schedule.students?.length === 0;
  const gradeMatch = !schedule.grade || schedule.grade === student.grade;

  return sameCenter && isCenterWide && gradeMatch;
};


exports.getStudentSchedules = catchAsync(async (req, res) => {
  const student = await User.findById(req.user.id).populate(
    'examCenter',
    'name centerCode city address'
  );

  if (!student) {
    throw new AppError('Student not found', 404);
  }
  if (!student.examCenter) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'You are not linked to any exam center yet. Please contact admin.',
    });
  }

  const centerId = student.examCenter._id;
  const now = new Date();
  const orConditions = [{ students: student._id }];

  const centerCondition = {
    examCenterId: centerId,
    students: { $size: 0 }, 
  };

  if (student.grade) {
    orConditions.push({ ...centerCondition, grade: student.grade });
  } else {
    orConditions.push(centerCondition);
  }

  const schedules = await Schedule.find({
    $or: orConditions,
    isActive: true,
    deletedAt: null,
    examDate: { $gte: now },
    status: { $in: ['upcoming', 'ongoing'] },
  })
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .sort({ examDate: 1, examTime: 1 });

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules,
    meta: {
      centerId: student.examCenter._id,
      centerName: student.examCenter.name,
      grade: student.grade || null,
    },
  });
});

exports.getUpcomingSchedules = catchAsync(async (req, res) => {
  const now = new Date();

  const query = {
    examDate: { $gte: now },
    status: 'upcoming',
    isActive: true,
    deletedAt: null,
  };

  if (req.user.role === 'student') {
    const student = await User.findById(req.user.id).select(
      'examCenter grade registeredSchedules'
    );

    if (!student.examCenter) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'Not linked to any center yet',
      });
    }

    const orConditions = [{ students: student._id }];
    const centerCondition = {
      examCenterId: student.examCenter,
      students: { $size: 0 },
    };

    if (student.grade) {
      orConditions.push({ ...centerCondition, grade: student.grade });
    } else {
      orConditions.push(centerCondition);
    }

    query.$or = orConditions;
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter) {
      query.examCenterId = official.assignedCenter;
    } else {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
  }

  const schedules = await Schedule.find(query)
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .sort({ examDate: 1, examTime: 1 })
    .limit(10);

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules,
  });
});



exports.registerStudentForSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate('examCenterId');

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  if (schedule.status === 'completed' || schedule.status === 'cancelled') {
    throw new AppError('Cannot register for completed or cancelled schedule', 400);
  }

  if (schedule.isFull) {
    throw new AppError('Schedule is full', 400);
  }

  const student = await User.findById(req.user.id);

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (
    student.examCenter &&
    schedule.examCenterId?._id?.toString() !== student.examCenter.toString()
  ) {
    throw new AppError('You can only register for schedules at your center', 403);
  }

  if (schedule.grade && student.grade && schedule.grade !== student.grade) {
    throw new AppError('This schedule is not for your grade', 403);
  }

  if (!student.registeredSchedules) {
    student.registeredSchedules = [];
  }

  if (student.registeredSchedules.some((id) => id.toString() === schedule._id.toString())) {
    throw new AppError('Already registered for this schedule', 400);
  }

  student.registeredSchedules.push(schedule._id);
  await student.save();

  schedule.registeredStudents += 1;
  if (!schedule.students.some((id) => id.toString() === student._id.toString())) {
    schedule.students.push(student._id);
  }
  await schedule.save();

  await Notification.create({
    title: 'Exam Registration Confirmed',
    message: `You have successfully registered for ${schedule.subject} exam on ${new Date(
      schedule.examDate
    ).toLocaleDateString()} at ${schedule.examCenterId.name}`,
    sentBy: req.user.id,
    targetUsers: [req.user.id],
    targetCenter: schedule.examCenterId._id,
    relatedSchedule: schedule._id,
    type: 'exam_update',
    priority: 'high',
    metadata: {
      source: 'system',
      scheduleId: schedule._id,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Successfully registered for schedule',
    data: {
      scheduleId: schedule._id,
      subject: schedule.subject,
      examDate: schedule.examDate,
    },
  });
});


exports.unregisterStudentFromSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  if (schedule.status === 'completed') {
    throw new AppError('Cannot unregister from completed schedule', 400);
  }

  const student = await User.findById(req.user.id);

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (
    !student.registeredSchedules ||
    !student.registeredSchedules.some((id) => id.toString() === schedule._id.toString())
  ) {
    throw new AppError('Not registered for this schedule', 400);
  }

  student.registeredSchedules = student.registeredSchedules.filter(
    (id) => id.toString() !== schedule._id.toString()
  );
  await student.save();

  schedule.registeredStudents = Math.max(0, schedule.registeredStudents - 1);
  schedule.students = schedule.students.filter(
    (id) => id.toString() !== student._id.toString()
  );
  await schedule.save();

  await Notification.create({
    title: 'Exam Registration Cancelled',
    message: `You have been unregistered from ${schedule.subject} exam on ${new Date(
      schedule.examDate
    ).toLocaleDateString()}`,
    sentBy: req.user.id,
    targetUsers: [req.user.id],
    targetCenter: schedule.examCenterId,
    relatedSchedule: schedule._id,
    type: 'exam_update',
    priority: 'medium',
    metadata: {
      source: 'system',
      scheduleId: schedule._id,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Successfully unregistered from schedule',
  });
});

exports.getAllSchedules = catchAsync(async (req, res) => {
  const {
    status,
    examCenterId,
    subject,
    grade,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { deletedAt: null };
  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter) {
      query.examCenterId = official.assignedCenter;
    } else {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit, total: 0, pages: 0 },
      });
    }
  } else if (examCenterId) {
    query.examCenterId = examCenterId;
  }

  if (status) query.status = status;
  if (grade) query.grade = grade;
  if (subject) query.subject = { $regex: subject, $options: 'i' };

  if (startDate || endDate) {
    query.examDate = {};
    if (startDate) query.examDate.$gte = new Date(startDate);
    if (endDate) query.examDate.$lte = new Date(endDate);
  }

  const schedules = await Schedule.find(query)
    .populate('examCenterId', 'name centerCode address city')
    .populate('createdBy', 'name email')
    .sort({ examDate: 1, examTime: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Schedule.countDocuments(query);

  res.status(200).json({
    success: true,
    data: schedules,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});


exports.getScheduleById = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  if (req.user.role === 'student') {
    const student = await User.findById(req.user.id).select(
      'examCenter grade registeredSchedules'
    );

    if (!isScheduleAccessibleByStudent(schedule, student)) {
      throw new AppError('You do not have access to this schedule', 403);
    }
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    const scheduleCenter = schedule.examCenterId?._id?.toString() || schedule.examCenterId?.toString();
    if (official?.assignedCenter?.toString() !== scheduleCenter) {
      throw new AppError('You do not have access to this schedule', 403);
    }
  }

  res.status(200).json({
    success: true,
    data: schedule,
  });
});


exports.createSchedule = catchAsync(async (req, res) => {
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

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (!official?.assignedCenter) {
      throw new AppError('You are not assigned to any center', 403);
    }
    if (official.assignedCenter.toString() !== examCenterId) {
      throw new AppError('You can only create schedules for your assigned center', 403);
    }
  }

  const center = await ExamCenter.findById(examCenterId);
  if (!center) {
    throw new AppError('Exam center not found', 404);
  }
  const conflictQuery = {
    examCenterId,
    examDate: new Date(examDate),
    subject,
    deletedAt: null,
  };
  if (grade) conflictQuery.grade = grade;

  const existingSchedule = await Schedule.findOne(conflictQuery);

  if (existingSchedule) {
    throw new AppError(
      'Schedule already exists for this center, date, subject, and grade',
      400
    );
  }

  const schedule = await Schedule.create({
    examCenterId,
    examDate,
    examTime,
    subject,
    subjectCode,
    grade: grade || null,
    students: students || [],
    totalStudents: totalStudents || 0,
    registeredStudents: students?.length || 0,
    duration: duration || 180,
    roomNumber: roomNumber || '',
    invigilators: invigilators || [],
    notes: notes || '',
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  await schedule.populate('examCenterId', 'name centerCode address city');

  logger.info(`Schedule created: ${schedule.subject} at ${center.name}`);

  res.status(201).json({
    success: true,
    data: schedule,
  });
});

exports.updateSchedule = catchAsync(async (req, res) => {
  let schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }
  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter?.toString() !== schedule.examCenterId?.toString()) {
      throw new AppError('You can only update schedules for your assigned center', 403);
    }
  }

  const updateData = { ...req.body };
  updateData.updatedBy = req.user.id;
  delete updateData.createdBy;
  delete updateData.examCenterId;

  if (updateData.examDate) {
    updateData.examDate = new Date(updateData.examDate);
  }

  if (updateData.examDate) {
    const centerId = schedule.examCenterId;
    const examDate = updateData.examDate;

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
        throw new AppError('Schedule conflict: Center already has an exam on this date', 400);
      }
    }
  }

  schedule = await Schedule.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: false,
  }).populate('examCenterId', 'name centerCode address city');

  logger.info(`Schedule updated: ${schedule._id}`);

  res.status(200).json({
    success: true,
    data: schedule,
  });
});

exports.deleteSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter?.toString() !== schedule.examCenterId?.toString()) {
      throw new AppError('You can only delete schedules for your assigned center', 403);
    }
  }

  await schedule.softDelete();

  logger.info(`Schedule soft-deleted: ${schedule._id}`);

  res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully',
  });
});

exports.getScheduleStats = catchAsync(async (req, res) => {
  const stats = await Schedule.getStats();

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  let centerFilter = {};
  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter) {
      centerFilter = { examCenterId: official.assignedCenter };
    }
  }

  const nextWeekSchedules = await Schedule.countDocuments({
    ...centerFilter,
    examDate: { $gte: now, $lte: nextWeek },
    deletedAt: null,
    isActive: true,
  });

  const byCenter = await Schedule.aggregate([
    { $match: { deletedAt: null, ...centerFilter } },
    {
      $group: {
        _id: '$examCenterId',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      nextWeekSchedules,
      topCenters: byCenter,
    },
  });
});

exports.getSchedulesByCenter = catchAsync(async (req, res) => {
  const centerId = req.params.centerId;

  const center = await ExamCenter.findById(centerId);
  if (!center) {
    throw new AppError('Center not found', 404);
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter?.toString() !== centerId) {
      throw new AppError('You can only view schedules for your assigned center', 403);
    }
  }

  const schedules = await Schedule.find({
    examCenterId: centerId,
    deletedAt: null,
    isActive: true,
  })
    .sort({ examDate: 1, examTime: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules,
  });
});


exports.getScheduleByDateRange = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new AppError('Please provide startDate and endDate', 400);
  }

  const query = {
    examDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    deletedAt: null,
    isActive: true,
  };

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter) {
      query.examCenterId = official.assignedCenter;
    }
  }

  const schedules = await Schedule.find(query)
    .populate('examCenterId', 'name centerCode address city')
    .sort({ examDate: 1 });

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules,
  });
});


exports.updateScheduleStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError('Please provide status', 400);
  }

  const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter?.toString() !== schedule.examCenterId?.toString()) {
      throw new AppError('You can only update your center schedules', 403);
    }
  }

  schedule.status = status;
  schedule.updatedBy = req.user.id;

  if (status === 'ongoing') {
    schedule.metadata.announcementSent = true;
    schedule.metadata.announcementDate = new Date();
  }

  await schedule.save();

  logger.info(`Schedule status updated: ${schedule._id} → ${status}`);

  res.status(200).json({
    success: true,
    data: schedule,
  });
});



exports.publishResults = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  if (schedule.status !== 'completed') {
    throw new AppError('Cannot publish results for non-completed schedule', 400);
  }

  if (req.user.role === 'board_official') {
    const official = await User.findById(req.user.id).select('assignedCenter');
    if (official?.assignedCenter?.toString() !== schedule.examCenterId?.toString()) {
      throw new AppError('You can only publish results for your center', 403);
    }
  }

  schedule.metadata.resultsPublished = true;
  schedule.metadata.resultPublishedDate = new Date();
  schedule.updatedBy = req.user.id;
  await schedule.save();

  logger.info(`Results published for schedule: ${schedule._id}`);

  res.status(200).json({
    success: true,
    message: 'Results published successfully',
    data: schedule,
  });
});