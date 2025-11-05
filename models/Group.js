const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  groupType: {
    type: String,
    enum: ['Coop', 'NGO', 'School', 'Religious Org', 'Other'],
    required: [true, 'Group type is required']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/i, 'Please enter a valid email']
  },
  password: { // 👈 ADD THIS FIELD
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  referralCode: {
    type: String,
    default: ''
  },
  tier: {
    type: String,
    enum: ['Free', 'Premium', 'Exclusive'],
    default: 'Free'
  },
  logo: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    min: 1
  },
  languagePreference: {
    type: String,
    default: 'en'
  },
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isCompleteProfile: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
groupSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
groupSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Group', groupSchema);