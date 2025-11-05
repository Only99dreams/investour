const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const firmSchema = new mongoose.Schema({
  firmName: {
    type: String,
    required: [true, 'Firm name is required'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sector is required']
  },
  countryOfRegistration: {
    type: String,
    required: [true, 'Country of registration is required']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required']
  },
  contactTitle: {
    type: String,
    required: [true, 'Contact title is required']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  businessEmail: {
    type: String,
    required: [true, 'Business email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/i, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  licenseNumber: {
    type: String,
    default: ''
  },
  licenseIssuingBody: {
    type: String,
    default: ''
  },
  licenseDocument: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  sectorFocus: {
    type: String,
    default: ''
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  staffAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
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
firmSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
firmSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Firm', firmSchema);