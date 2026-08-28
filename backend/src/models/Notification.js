// src/models/Notification.js - ✅ FINAL FIXED (No next)
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
    targetRole: {
      type: String,
      enum: ['all', 'students', 'board_official', 'admin'],
      default: 'all',
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['general', 'exam_update', 'schedule_reminder', 'result_announcement', 'system_alert'],
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
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

// ==================== INDEXES ====================
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

// ==================== VIRTUAL FIELDS ====================
NotificationSchema.virtual('isExpired').get(function () {
  return this.expiryDate && new Date(this.expiryDate) < new Date();
});

NotificationSchema.virtual('isScheduled').get(function () {
  return this.scheduledAt && new Date(this.scheduledAt) > new Date();
});

NotificationSchema.virtual('isDelivered').get(function () {
  return this.sentAt !== null;
});

// ==================== PRE-SAVE HOOK (✅ FIXED) ====================
// ✅ next() hata diya, async laga diya
NotificationSchema.pre('save', async function () {
  if (this.title) this.title = this.title.trim();
  if (this.message) this.message = this.message.trim();

  if (!this.scheduledAt) {
    this.sentAt = new Date();
  }

  if (!this.targetUsers) {
    this.targetUsers = [];
  }

  // ✅ next() call NAHI karna
});

// ==================== INSTANCE METHODS ====================

NotificationSchema.methods.markAsRead = async function (userId) {
  if (this.isRead) return true;

  const alreadyRead = this.readBy.some((r) => r.userId.toString() === userId.toString());
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

// ==================== STATIC METHODS ====================

NotificationSchema.statics.countUnreadForUser = async function (userId) {
  return this.countDocuments({
    isActive: true,
    isDeleted: false,
    sentAt: { $ne: null },
    $or: [{ targetRole: 'all' }, { targetUsers: userId }],
    readBy: { $not: { $elemMatch: { userId } } },
  });
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

// ==================== EXPORT ====================
module.exports = mongoose.model('Notification', NotificationSchema);