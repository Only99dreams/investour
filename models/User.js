const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/i, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  disability: {
    type: String,
    enum: ['Yes', 'No', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  referralCode: {
    type: String,
    default: ''
  },
  userType: {
    type: String,
    enum: ['individual', 'group', 'firm'],
    required: [true, 'User type is required']
  },
  tier: {
    type: String,
    enum: ['Free', 'Premium', 'Exclusive'],
    default: 'Free'
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  residentialAddress: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  sector: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  languagesSpoken: [{
    type: String
  }],
  whySigningUp: [{
    type: String,
    enum: [
      'To learn about money and investing',
      'To protect myself from scams',
      'To access safe investment opportunities',
      'To learn about climate resilience',
      'To learn and make money as a Grassroots Financial Educator - GFE'
    ]
  }],
  isGFE: {
    type: Boolean,
    default: false
  },
  gfeAgreementDate: {
    type: Date
  },
  bankAccount: {
    accountNumber: {
      type: String,
      default: ''
    },
    bankName: {
      type: String,
      default: ''
    },
    accountHolder: {
      type: String,
      default: ''
    }
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isCompleteProfile: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Add this after `userType`
role: {
  type: String,
  enum: ['user', 'admin', 'super_admin', 'finance', 'support', 'coordinator'],
  default: 'user'
}
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});



// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);