const Schedule = require('../models/Schedule');
const ExamCenter = require('../models/ExamCenter');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');

exports.getStudentSchedules = catchAsync(async (req, res) => {
  const student = await User.findById(req.user.id)
    .populate({
      path: 'registeredSchedules',
      match: { deletedAt: null },
      populate: {
        path: 'examCenterId',
        select: 'name centerCode address city latitude longitude'
      },
      options: { sort: { examDate: 1 } }
    });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  let schedules = student.registeredSchedules || [];

  if (schedules.length === 0) {
    const allSchedules = await Schedule.find({
      deletedAt: null,
      isActive: true,
      status: 'upcoming'
    })
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .sort({ examDate: 1, examTime: 1 })
    .limit(20);

    schedules = allSchedules;
  }

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});


exports.getUpcomingSchedules = catchAsync(async (req, res) => {
  const now = new Date();
  const query = {
    examDate: { $gte: now },
    status: 'upcoming',
    isActive: true,
    deletedAt: null
  };

  if (req.user.role === 'student') {
    const student = await User.findById(req.user.id).select('registeredSchedules');
    if (student && student.registeredSchedules && student.registeredSchedules.length > 0) {
      query._id = { $in: student.registeredSchedules };
    } else {
      const allSchedules = await Schedule.find({
        deletedAt: null,
        isActive: true,
        status: 'upcoming'
      })
      .populate('examCenterId', 'name centerCode address city latitude longitude')
      .sort({ examDate: 1, examTime: 1 })
      .limit(10);

      return res.status(200).json({
        success: true,
        count: allSchedules.length,
        data: allSchedules
      });
    }
  }

  const schedules = await Schedule.find(query)
    .populate('examCenterId', 'name centerCode address city latitude longitude')
    .sort({ examDate: 1, examTime: 1 })
    .limit(10);

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
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

  if (!student.registeredSchedules) {
    student.registeredSchedules = [];
  }

  if (student.registeredSchedules.some(id => id.toString() === schedule._id.toString())) {
    throw new AppError('Already registered for this schedule', 400);
  }

  student.registeredSchedules.push(schedule._id);
  await student.save();

  schedule.registeredStudents += 1;
  await schedule.save();

  await Notification.create({
    title: 'Exam Registration Confirmed',
    message: `You have successfully registered for ${schedule.subject} exam on ${new Date(schedule.examDate).toLocaleDateString()} at ${schedule.examCenterId.name}`,
    sentBy: req.user.id,
    targetUsers: [req.user.id],
    type: 'registration',
    priority: 'high',
    metadata: {
      source: 'system',
      scheduleId: schedule._id,
    }
  });

  res.status(200).json({
    success: true,
    message: 'Successfully registered for schedule',
    data: {
      scheduleId: schedule._id,
      subject: schedule.subject,
      examDate: schedule.examDate
    }
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

  if (!student.registeredSchedules || !student.registeredSchedules.some(id => id.toString() === schedule._id.toString())) {
    throw new AppError('Not registered for this schedule', 400);
  }

  student.registeredSchedules = student.registeredSchedules.filter(
    id => id.toString() !== schedule._id.toString()
  );
  await student.save();

  schedule.registeredStudents = Math.max(0, schedule.registeredStudents - 1);
  await schedule.save();

  await Notification.create({
    title: 'Exam Registration Cancelled',
    message: `You have been unregistered from ${schedule.subject} exam on ${new Date(schedule.examDate).toLocaleDateString()}`,
    sentBy: req.user.id,
    targetUsers: [req.user.id],
    type: 'registration',
    priority: 'medium',
    metadata: {
      source: 'system',
      scheduleId: schedule._id,
    }
  });

  res.status(200).json({
    success: true,
    message: 'Successfully unregistered from schedule'
  });
});


exports.getAllSchedules = catchAsync(async (req, res) => {
  const { status, examCenterId, subject, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = { deletedAt: null };

  if (status) query.status = status;
  if (examCenterId) query.examCenterId = examCenterId;
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
      pages: Math.ceil(total / limit)
    }
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
    const student = await User.findById(req.user.id).select('registeredSchedules');
    if (!student.registeredSchedules || !student.registeredSchedules.includes(schedule._id)) {
      throw new AppError('You are not registered for this schedule', 403);
    }
  }

  res.status(200).json({
    success: true,
    data: schedule
  });
});


exports.createSchedule = catchAsync(async (req, res) => {
  const { examCenterId, examDate, examTime, subject, subjectCode, totalStudents, duration, roomNumber, invigilators, notes } = req.body;

  const center = await ExamCenter.findById(examCenterId);
  if (!center) {
    throw new AppError('Exam center not found', 404);
  }

  const existingSchedule = await Schedule.findOne({
    examCenterId,
    examDate: new Date(examDate),
    subject,
    deletedAt: null
  });

  if (existingSchedule) {
    throw new AppError('Schedule already exists for this center, date, and subject', 400);
  }

  const schedule = await Schedule.create({
    examCenterId,
    examDate,
    examTime,
    subject,
    subjectCode,
    totalStudents: totalStudents || 0,
    duration: duration || 180,
    roomNumber: roomNumber || '',
    invigilators: invigilators || [],
    notes: notes || '',
    createdBy: req.user.id,
    updatedBy: req.user.id
  });

  await schedule.populate('examCenterId', 'name centerCode address city');

  res.status(201).json({
    success: true,
    data: schedule
  });
});

exports.updateSchedule = catchAsync(async (req, res) => {
  let schedule = await Schedule.findById(req.params.id);

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
        throw new AppError('Schedule conflict: Center already has an exam on this date', 400);
      }
    }
  }

  schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: false, 
    }
  ).populate('examCenterId', 'name centerCode address city');

  res.status(200).json({
    success: true,
    data: schedule
  });
});

exports.deleteSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  await schedule.softDelete();

  res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully'
  });
});

exports.getScheduleStats = catchAsync(async (req, res) => {
  const stats = await Schedule.getStats();

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const nextWeekSchedules = await Schedule.countDocuments({
    examDate: { $gte: now, $lte: nextWeek },
    deletedAt: null,
    isActive: true
  });

  const byCenter = await Schedule.aggregate([
    { $match: { deletedAt: null } },
    { $group: {
        _id: '$examCenterId',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      nextWeekSchedules,
      topCenters: byCenter
    }
  });
});

exports.getSchedulesByCenter = catchAsync(async (req, res) => {
  const centerId = req.params.centerId;

  const center = await ExamCenter.findById(centerId);
  if (!center) {
    throw new AppError('Center not found', 404);
  }

  const schedules = await Schedule.find({
    examCenterId: centerId,
    deletedAt: null,
    isActive: true
  })
  .sort({ examDate: 1, examTime: 1 })
  .lean();

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

exports.getScheduleByDateRange = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new AppError('Please provide startDate and endDate', 400);
  }

  const schedules = await Schedule.find({
    examDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    deletedAt: null,
    isActive: true
  })
  .populate('examCenterId', 'name centerCode address city')
  .sort({ examDate: 1 });

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

exports.updateScheduleStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    throw new AppError('Please provide status', 400);
  }

  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || schedule.deletedAt) {
    throw new AppError('Schedule not found', 404);
  }

  schedule.status = status;
  schedule.updatedBy = req.user.id;
  
  if (status === 'ongoing') {
    schedule.metadata.announcementSent = true;
    schedule.metadata.announcementDate = new Date();
  }

  await schedule.save();

  res.status(200).json({
    success: true,
    data: schedule
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

  schedule.metadata.resultsPublished = true;
  schedule.metadata.resultPublishedDate = new Date();
  schedule.updatedBy = req.user.id;
  await schedule.save();

  res.status(200).json({
    success: true,
    message: 'Results published successfully',
    data: schedule
  });
});