const mongoose = require('mongoose');

const ExamCenterSchema = new mongoose.Schema(
  {
    centerCode: {
      type: String,
      required: [true, 'Please add a center code'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{3,10}$/, 'Center code must be 3-10 alphanumeric characters'],
    },
    name: {
      type: String,
      required: [true, 'Please add a center name'],
      trim: true,
      minlength: [3, 'Center name must be at least 3 characters'],
      maxlength: [100, 'Center name cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    latitude: {
      type: Number,
      required: [true, 'Please add latitude'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please add longitude'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'Pakistan',
    },

    contactNumber: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, 'Please add a valid phone number'],
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      default: '',
    },

    boardOfficial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    centerAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    capacity: {
      type: Number,
      default: 100,
      min: [1, 'Capacity must be at least 1'],
      max: [10000, 'Capacity cannot exceed 10,000'],
    },

    facilities: {
      type: [String],
      default: [],
    },

    logo: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    openingHours: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        monday: '09:00-17:00',
        tuesday: '09:00-17:00',
        wednesday: '09:00-17:00',
        thursday: '09:00-17:00',
        friday: '09:00-17:00',
        saturday: '09:00-13:00',
        sunday: 'closed',
      },
    },

    metadata: {
      lastInspection: Date,
      inspectionStatus: {
        type: String,
        enum: ['pending', 'passed', 'failed', 'not_scheduled'],
        default: 'not_scheduled',
      },
      notes: String,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ExamCenterSchema.index({ name: 1 });
ExamCenterSchema.index({ city: 1 });
ExamCenterSchema.index({ country: 1 });
ExamCenterSchema.index({ isActive: 1 });
ExamCenterSchema.index({ deletedAt: 1 });
ExamCenterSchema.index({ latitude: 1, longitude: 1 });
ExamCenterSchema.index({ boardOfficial: 1 });
ExamCenterSchema.index({ centerAdmin: 1 });
ExamCenterSchema.index({ city: 1, isActive: 1, deletedAt: 1 });
ExamCenterSchema.virtual('fullAddress').get(function () {
  const parts = [this.address, this.city, this.state, this.country].filter(Boolean);
  return parts.join(', ');
});

ExamCenterSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});
ExamCenterSchema.virtual('students', {
  ref: 'User',
  localField: '_id',
  foreignField: 'examCenter',
  match: { role: 'student', deletedAt: null },
});
ExamCenterSchema.virtual('schedules', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'examCenterId',
  match: { deletedAt: null },
});
ExamCenterSchema.virtual('officialInfo', {
  ref: 'User',
  localField: 'boardOfficial',
  foreignField: '_id',
  justOne: true,
});
// MIDDLEWARE — pre-save
ExamCenterSchema.pre('save', async function () {
  if (this.centerCode) {
    this.centerCode = this.centerCode.toUpperCase().trim();
  }
  if (this.address) this.address = this.address.trim();
  if (this.city) this.city = this.city.trim();
  if (this.contactEmail) this.contactEmail = this.contactEmail.toLowerCase().trim();
  if (this.state) this.state = this.state.trim();
  if (this.country) this.country = this.country.trim();
});


ExamCenterSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
};

ExamCenterSchema.methods.restore = async function () {
  this.deletedAt = null;
  this.isActive = true;
  await this.save();
};

ExamCenterSchema.methods.assignBoardOfficial = async function (userId) {
  this.boardOfficial = userId;
  await this.save();
  return this;
};

ExamCenterSchema.methods.removeBoardOfficial = async function () {
  this.boardOfficial = null;
  await this.save();
  return this;
};

ExamCenterSchema.methods.recalculateStudents = async function () {
  const User = mongoose.model('User');
  const count = await User.countDocuments({
    role: 'student',
    examCenter: this._id,
    isActive: true,
    deletedAt: null,
  });
  this.totalStudents = count;
  await this.save();
  return count;
};

ExamCenterSchema.methods.hasCapacity = function (additional = 1) {
  return this.totalStudents + additional <= this.capacity;
};

ExamCenterSchema.statics.getStats = async function () {
  const [total, active, verified] = await Promise.all([
    this.countDocuments({ deletedAt: null }),
    this.countDocuments({ isActive: true, deletedAt: null }),
    this.countDocuments({ isVerified: true, deletedAt: null }),
  ]);

  return {
    totalCenters: total,
    activeCenters: active,
    verifiedCenters: verified,
  };
};

ExamCenterSchema.statics.findActive = function () {
  return this.find({ isActive: true, deletedAt: null });
};

ExamCenterSchema.statics.findByCity = function (city) {
  return this.find({
    city: new RegExp(`^${city}$`, 'i'),
    isActive: true,
    deletedAt: null,
  });
};

ExamCenterSchema.statics.findByOfficial = function (userId) {
  return this.find({
    boardOfficial: userId,
    deletedAt: null,
  });
};

ExamCenterSchema.statics.search = function (query) {
  const regex = new RegExp(query, 'i');
  return this.find({
    $or: [{ name: regex }, { centerCode: regex }, { city: regex }],
    isActive: true,
    deletedAt: null,
  }).limit(20);
};

ExamCenterSchema.statics.getTopCenters = function (limit = 10) {
  return this.find({ isActive: true, deletedAt: null })
    .sort({ totalStudents: -1 })
    .limit(limit)
    .select('name centerCode city totalStudents capacity');
};

module.exports = mongoose.model('ExamCenter', ExamCenterSchema);