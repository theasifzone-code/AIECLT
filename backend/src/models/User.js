
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
    country: {
      type: String,
      default: 'Pakistan',
      trim: true,
    },
    registeredSchedules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      default: [],
    }],
    isActive: {
      type: Boolean,
      default: true,
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ registeredSchedules: 1 }); 


UserSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

UserSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});


UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error(' Password hashing error:', error);
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
  return this.registeredSchedules && 
         this.registeredSchedules.some(id => id.toString() === scheduleId.toString());
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
    deletedAt: null
  });
};


module.exports = mongoose.model('User', UserSchema);