const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  secret: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['test', 'live'],
    default: 'test',
  },
  permissions: {
    type: [String],
    enum: ['read', 'write'],
    default: ['read'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active',
  },
  expires: {
    type: Date,
    default: null,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('ApiKey', schema);