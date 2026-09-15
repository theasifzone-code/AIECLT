const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamCenter',
      default: null,
    },
    relatedSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      default: null,
    },

    targetRole: {
      type: String,
      enum: ['all', 'students', 'board_official', 'admin'],
      default: 'all',
    },

    targetGrade: {
      type: String,
      enum: ['9', '10', '11', '12', 'other', null],
      default: null,
    },

    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: [
        'general',
        'exam_update',
        'schedule_reminder',
        'result_announcement',
        'system_alert',
        'center_update',
      ],
      default: 'general',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },

    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    readCount: {
      type: Number,
      default: 0,
    },

    totalRecipients: {
      type: Number,
      default: 0,
    },

    deliveredCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    metadata: {
      source: {
        type: String,
        default: 'system',
      },
      category: {
        type: String,
        default: '',
      },
      link: {
        type: String,
        default: '',
      },
      extraData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
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

NotificationSchema.index({ sentBy: 1 });
NotificationSchema.index({ targetRole: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ expiryDate: 1 });
NotificationSchema.index({ isActive: 1 });
NotificationSchema.index({ isDeleted: 1 });
NotificationSchema.index({ deletedAt: 1 });
NotificationSchema.index({ 'readBy.userId': 1 });
NotificationSchema.index({ type: 1, priority: 1 });
NotificationSchema.index({ createdAt: -1, targetRole: 1 });
NotificationSchema.index({ targetCenter: 1, createdAt: -1 });
NotificationSchema.index({ targetGrade: 1 });
NotificationSchema.index({ relatedSchedule: 1 });
NotificationSchema.index({ targetCenter: 1, targetRole: 1, isActive: 1 });
NotificationSchema.virtual('isExpired').get(function () {
  return this.expiryDate && new Date(this.expiryDate) < new Date();
});

NotificationSchema.virtual('isScheduled').get(function () {
  return this.scheduledAt && new Date(this.scheduledAt) > new Date();
});

NotificationSchema.virtual('isDelivered').get(function () {
  return this.sentAt !== null;
});

NotificationSchema.virtual('centerInfo', {
  ref: 'ExamCenter',
  localField: 'targetCenter',
  foreignField: '_id',
  justOne: true,
});

NotificationSchema.virtual('senderInfo', {
  ref: 'User',
  localField: 'sentBy',
  foreignField: '_id',
  justOne: true,
});


NotificationSchema.pre('save', async function () {
  if (this.title) this.title = this.title.trim();
  if (this.message) this.message = this.message.trim();

  if (!this.scheduledAt && !this.sentAt) {
    this.sentAt = new Date();
  }

  if (!this.targetUsers) {
    this.targetUsers = [];
  }
});

NotificationSchema.methods.markAsRead = async function (userId) {
  if (this.isRead) return true;

  const alreadyRead = this.readBy.some(
    (r) => r.userId.toString() === userId.toString()
  );
  if (alreadyRead) return true;

  this.readBy.push({
    userId,
    readAt: new Date(),
  });

  this.readCount += 1;

  if (this.readCount >= this.totalRecipients) {
    this.isRead = true;
  }

  await this.save();
  return true;
};

NotificationSchema.methods.isReadByUser = function (userId) {
  return this.readBy.some((r) => r.userId.toString() === userId.toString());
};

NotificationSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
};

NotificationSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.isActive = true;
  await this.save();
};

NotificationSchema.methods.isForUser = function (user) {
  if (this.targetUsers?.length > 0) {
    return this.targetUsers.some((id) => id.toString() === user._id.toString());
  }

  const roleMatch =
    this.targetRole === 'all' ||
    (this.targetRole === 'students' && user.role === 'student') ||
    (this.targetRole === 'board_official' && user.role === 'board_official') ||
    (this.targetRole === 'admin' && user.role === 'admin');

  if (!roleMatch) return false;

  if (this.targetCenter) {
    const userCenter =
      user.role === 'student' ? user.examCenter : user.assignedCenter;
    if (!userCenter || userCenter.toString() !== this.targetCenter.toString()) {
      return false;
    }
  }

  if (this.targetGrade && user.role === 'student') {
    if (user.grade !== this.targetGrade) return false;
  }

  return true;
};

NotificationSchema.statics.countUnreadForUser = async function (user) {
  const filter = {
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    readBy: { $not: { $elemMatch: { userId: user._id } } },
    $or: [
      { targetUsers: user._id },
      { targetUsers: { $size: 0 }, targetCenter: null, targetRole: 'all' },
      {
        targetUsers: { $size: 0 },
        targetCenter: null,
        targetRole:
          user.role === 'student'
            ? 'students'
            : user.role === 'board_official'
              ? 'board_official'
              : 'admin',
      },
    ],
  };

  const userCenter =
    user.role === 'student' ? user.examCenter : user.assignedCenter;

  if (userCenter) {
    filter.$or.push({
      targetUsers: { $size: 0 },
      targetCenter: userCenter,
      targetRole:
        user.role === 'student'
          ? 'students'
          : user.role === 'board_official'
            ? 'board_official'
            : 'admin',
    });
  }

  return this.countDocuments(filter);
};

NotificationSchema.statics.getForUser = function (user, options = {}) {
  const filter = {
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: [
      { targetUsers: user._id },
      { targetUsers: { $size: 0 }, targetCenter: null, targetRole: 'all' },
      {
        targetUsers: { $size: 0 },
        targetCenter: null,
        targetRole:
          user.role === 'student'
            ? 'students'
            : user.role === 'board_official'
              ? 'board_official'
              : 'admin',
      },
    ],
  };

  const userCenter =
    user.role === 'student' ? user.examCenter : user.assignedCenter;

  if (userCenter) {
    filter.$or.push({
      targetUsers: { $size: 0 },
      targetCenter: userCenter,
      targetRole:
        user.role === 'student'
          ? 'students'
          : user.role === 'board_official'
            ? 'board_official'
            : 'admin',
    });
  }

  let query = this.find(filter)
    .populate('sentBy', 'name email role')
    .populate('targetCenter', 'name centerCode city')
    .sort({ createdAt: -1 });

  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);

  return query;
};

NotificationSchema.statics.getByCenter = function (centerId, options = {}) {
  const filter = {
    targetCenter: centerId,
    isActive: true,
    isDeleted: false,
  };

  if (options.targetRole) filter.targetRole = options.targetRole;
  if (options.type) filter.type = options.type;

  return this.find(filter)
    .populate('sentBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

NotificationSchema.statics.getSentBy = function (userId, options = {}) {
  return this.find({
    sentBy: userId,
    isDeleted: false,
  })
    .populate('targetCenter', 'name centerCode city')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

NotificationSchema.statics.getStats = async function () {
  const [total, active, read, unread] = await Promise.all([
    this.countDocuments({ isDeleted: false }),
    this.countDocuments({ isActive: true, isDeleted: false }),
    this.countDocuments({ isRead: true, isActive: true, isDeleted: false }),
    this.countDocuments({ isRead: false, isActive: true, isDeleted: false }),
  ]);

  return {
    total,
    active,
    read,
    unread,
    readRate: total > 0 ? Math.round((read / total) * 100) : 0,
  };
};

module.exports = mongoose.model('Notification', NotificationSchema);