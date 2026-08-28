// src/models/Schedule.js - ✅ FINAL FIXED (No next)
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    examCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamCenter',
      required: [true, 'Please add an exam center'],
    },
    examDate: {
      type: Date,
      required: [true, 'Please add exam date'],
      validate: {
        validator: function (value) {
          return value >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'Exam date cannot be in the past',
      },
    },
    examTime: {
      type: String,
      required: [true, 'Please add exam time'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please add a valid time (HH:MM)'],
    },
    subject: {
      type: String,
      required: [true, 'Please add subject'],
      trim: true,
      minlength: [2, 'Subject must be at least 2 characters'],
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    subjectCode: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]{3,10}$/, 'Subject code must be 3-10 alphanumeric characters'],
      default: '',
    },
    totalStudents: {
      type: Number,
      default: 0,
      min: [0, 'Total students cannot be negative'],
      max: [10000, 'Total students cannot exceed 10,000'],
    },
    registeredStudents: {
      type: Number,
      default: 0,
      min: [0, 'Registered students cannot be negative'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
      default: 'upcoming',
    },
    duration: {
      type: Number,
      default: 180,
      min: [30, 'Duration must be at least 30 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    invigilators: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      announcementSent: {
        type: Boolean,
        default: false,
      },
      announcementDate: Date,
      resultsPublished: {
        type: Boolean,
        default: false,
      },
      resultPublishedDate: Date,
      specialInstructions: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
ScheduleSchema.index({ examCenterId: 1 });
ScheduleSchema.index({ examDate: 1 });
ScheduleSchema.index({ subject: 1 });
ScheduleSchema.index({ status: 1 });
ScheduleSchema.index({ isActive: 1 });
ScheduleSchema.index({ deletedAt: 1 });
ScheduleSchema.index({ examCenterId: 1, examDate: 1 });
ScheduleSchema.index({ examDate: 1, status: 1 });

// ==================== VIRTUAL FIELDS ====================
ScheduleSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

ScheduleSchema.virtual('isPast').get(function () {
  return new Date(this.examDate) < new Date();
});

ScheduleSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.totalStudents - this.registeredStudents);
});

ScheduleSchema.virtual('isFull').get(function () {
  return this.registeredStudents >= this.totalStudents;
});

// ==================== PRE-SAVE HOOK (✅ FIXED) ====================
// ✅ next() hata diya, async laga diya
ScheduleSchema.pre('save', async function () {
  if (this.examDate && typeof this.examDate === 'string') {
    this.examDate = new Date(this.examDate);
    this.examDate.setHours(0, 0, 0, 0);
  }

  if (this.registeredStudents > this.totalStudents) {
    this.registeredStudents = this.totalStudents;
  }

  if (!this.subjectCode && this.subject) {
    this.subjectCode = this.subject
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 10);
  }

  // ✅ next() call NAHI karna
});

// ==================== INSTANCE METHODS ====================

ScheduleSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
};

ScheduleSchema.methods.restore = async function () {
  this.deletedAt = null;
  this.isActive = true;
  await this.save();
};

// ==================== STATIC METHODS ====================

ScheduleSchema.statics.getStats = async function () {
  const now = new Date();

  const [total, upcoming, ongoing, completed, cancelled] = await Promise.all([
    this.countDocuments({ deletedAt: null }),
    this.countDocuments({
      examDate: { $gte: now },
      status: 'upcoming',
      isActive: true,
      deletedAt: null,
    }),
    this.countDocuments({
      status: 'ongoing',
      isActive: true,
      deletedAt: null,
    }),
    this.countDocuments({
      status: 'completed',
      isActive: true,
      deletedAt: null,
    }),
    this.countDocuments({
      status: 'cancelled',
      isActive: true,
      deletedAt: null,
    }),
  ]);

  return {
    totalSchedules: total,
    upcoming,
    ongoing,
    completed,
    cancelled,
  };
};

// ==================== EXPORT ====================
module.exports = mongoose.model('Schedule', ScheduleSchema);