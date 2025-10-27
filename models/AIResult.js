const mongoose = require('mongoose');

const aiResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required']
  },
  query: {
    type: String,
    required: [true, 'Query is required']
  },
  type: {
    type: String,
    enum: ['search', 'analyze'],
    required: [true, 'Type is required']
  },
  result: {
    type: Object,
    required: [true, 'Result is required']
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  error: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['chatgpt', 'gemini', 'llama', 'custom_ai'],
    required: [true, 'Source is required']
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIResult', aiResultSchema);