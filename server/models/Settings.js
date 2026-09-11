const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'homepage',
    unique: true,
  },
  tagline: {
    type: String,
    default: 'Where proposals become projects.',
  },
  activeProjectsCount: {
    type: String,
    default: '128',
  },
  publicationsCount: {
    type: String,
    default: '340',
  },
  fundedAmount: {
    type: String,
    default: '৳4.2Cr',
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);