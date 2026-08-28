// src/models/User.js - ✅ FIXED FOR MONGOOSE 7+
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
      // ✅ NO index: true HERE
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      // ✅ NO index: true HERE
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
      // ✅ NO index: true HERE
    },
    country: {
      type: String,
      default: 'Pakistan',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      // ✅ NO index: true HERE
    },
    isEmailVerified: {
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
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, 'Please add a valid phone number'],
    },
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
    metadata: {
      ipAddress: String,
      userAgent: String,
      lastActive: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
      // ✅ NO index: true HERE
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== ✅ ALL INDEXES HERE ====================
// UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ deletedAt: 1 });

// ==================== VIRTUAL FIELDS ====================
UserSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

UserSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

// ==================== PRE-SAVE HOOK (FIXED) ====================
// ✅ `next` parameter hata diya gaya hai aur async/await use kiya gaya hai
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // ✅ Sirf return karein, next() nahi
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // ✅ next() call nahi karna, save automatic proceed hoga
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    throw error; // ✅ Error ko throw karein taake Mongoose use pakde
  }
});

// ==================== INSTANCE METHODS ====================

UserSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('❌ Password comparison error:', error);
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

// ==================== STATIC METHODS ====================

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

// ==================== EXPORT ====================
module.exports = mongoose.model('User', UserSchema);