const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(\+94|0)[1-9][0-9]{8}$/, 'Please enter a valid Sri Lankan phone number']
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin', 'exporter'],
    default: 'farmer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isExporterApproved: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  businessDetails: {
    businessName: String,
    businessType: String,
    registrationNumber: String,
    taxId: String
  },
  // For farmers
  farmDetails: {
    farmSize: Number, // in acres
    farmLocation: String,
    farmingExperience: Number, // in years
    certifications: [String]
  },
  // For buyers/exporters
  companyDetails: {
    companyName: String,
    companyType: String,
    exportLicense: String,
    importLicense: String,
    yearsInBusiness: Number
  },
  // For exporters
  exportDetails: {
    exportLicenseNumber: String,
    exportLicenseExpiry: Date,
    authorizedCountries: [String],
    exportHistory: [{
      year: Number,
      volume: Number,
      value: Number
    }]
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Verification fields
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'address.district': 1 });
userSchema.index({ isExporterApproved: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);
