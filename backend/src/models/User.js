const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'board_official', 'admin'],
      default: 'student',
    },

    examCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamCenter',
      default: null,
    },

    assignedCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamCenter',
      default: null,
    },
    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    grade: {
      type: String,
      enum: ['9', '10', '11', '12', 'other', null],
      default: null,
    },

    board: {
      type: String,
      trim: true,
      default: '',
    },

    city: {
      type: String,
      trim: true,
      default: '',
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    country: {
      type: String,
      default: 'Pakistan',
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, 'Please add a valid phone number'],
      default: '',
    },

    address: {
      type: String,
      trim: true,
      default: '',
    },
    registeredSchedules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
      },
    ],

    profileImage: {
      type: String,
      default: null,
    },

    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpire: {
      type: Date,
      select: false,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      lastActive: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ registeredSchedules: 1 });
UserSchema.index({ examCenter: 1 });
UserSchema.index({ assignedCenter: 1 });
UserSchema.index({ city: 1 });
UserSchema.index({ grade: 1 });
UserSchema.index({ role: 1, examCenter: 1, isActive: 1 });
UserSchema.index(
  { examCenter: 1, rollNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: 'student',
      rollNumber: { $type: 'string' },
      examCenter: { $type: 'objectId' },
    },
  }
);

UserSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

UserSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

UserSchema.virtual('centerInfo', {
  ref: 'ExamCenter',
  localField: 'examCenter',
  foreignField: '_id',
  justOne: true,
});

UserSchema.virtual('assignedCenterInfo', {
  ref: 'ExamCenter',
  localField: 'assignedCenter',
  foreignField: '_id',
  justOne: true,
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

UserSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

UserSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts += 1;

  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000;
  }

  await this.save();
};

UserSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
};

UserSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
};

UserSchema.methods.restore = async function () {
  this.deletedAt = null;
  this.isActive = true;
  await this.save();
};

UserSchema.methods.isRegisteredForSchedule = function (scheduleId) {
  return (
    this.registeredSchedules &&
    this.registeredSchedules.some((id) => id.toString() === scheduleId.toString())
  );
};

UserSchema.methods.isLinkedToCenter = function () {
  if (this.role === 'student') return !!this.examCenter;
  if (this.role === 'board_official') return !!this.assignedCenter;
  return true;
};

UserSchema.methods.registerForSchedule = async function (scheduleId) {
  if (this.isRegisteredForSchedule(scheduleId)) {
    throw new Error('Already registered for this schedule');
  }
  this.registeredSchedules.push(scheduleId);
  await this.save();
  return this;
};

UserSchema.methods.unregisterFromSchedule = async function (scheduleId) {
  const idStr = scheduleId.toString();
  this.registeredSchedules = this.registeredSchedules.filter(
    (id) => id.toString() !== idStr
  );
  await this.save();
  return this;
};
UserSchema.statics.findByEmail = function (email, includePassword = false) {
  const query = this.findOne({ email: email.toLowerCase() });
  if (includePassword) {
    return query.select('+password');
  }
  return query;
};

UserSchema.statics.findActive = function () {
  return this.find({ isActive: true, deletedAt: null });
};

UserSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true, deletedAt: null });
};

UserSchema.statics.findByRegisteredSchedule = function (scheduleId) {
  return this.find({
    registeredSchedules: scheduleId,
    isActive: true,
    deletedAt: null,
  });
};

UserSchema.statics.findStudentsByCenter = function (centerId) {
  return this.find({
    role: 'student',
    examCenter: centerId,
    isActive: true,
    deletedAt: null,
  }).sort({ rollNumber: 1 });
};

UserSchema.statics.findBoardOfficialByCenter = function (centerId) {
  return this.findOne({
    role: 'board_official',
    assignedCenter: centerId,
    isActive: true,
    deletedAt: null,
  });
};

UserSchema.statics.countStudentsByCenter = function (centerId) {
  return this.countDocuments({
    role: 'student',
    examCenter: centerId,
    isActive: true,
    deletedAt: null,
  });
};

UserSchema.statics.searchStudents = function (query, centerId = null) {
  const regex = new RegExp(query, 'i');
  const filter = {
    role: 'student',
    isActive: true,
    deletedAt: null,
    $or: [{ name: regex }, { email: regex }, { rollNumber: regex }],
  };
  if (centerId) filter.examCenter = centerId;
  return this.find(filter).limit(20);
};

module.exports = mongoose.model('User', UserSchema);