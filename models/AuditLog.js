const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required']
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor is required']
  },
  actorRole: {
    type: String,
    enum: ['user', 'group', 'firm', 'admin', 'super_admin', 'finance', 'support'],
    required: [true, 'Actor role is required']
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: [true, 'Target is required']
  },
  targetModel: {
    type: String,
    enum: ['User', 'Group', 'Firm', 'Post', 'Investment', 'Wallet', 'Referral', 'GFE', 'Advertisement', 'AuditLog'],
    required: [true, 'Target model is required']
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required']
  },
  userAgent: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);