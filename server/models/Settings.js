const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'homepage',
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
    default: 'à§³4.2Cr',
  },
  aboutMission: {
    type: String,
    default: 'We advance research culture at Khulna University by supporting proposal development, funding pathways, and interdisciplinary collaboration across departments.',
  },
  directorName: {
    type: String,
    default: 'Dr. Kazi Masudul Alam',
  },
  directorTitle: {
    type: String,
    default: 'Director, KURIC',
  },
  contactEmail: {
    type: String,
    default: 'kuric@ku.ac.bd',
  },
  contactAddress: {
    type: String,
    default: 'Khulna University, Khulna 9208',
  },
  contactPhone: {
    type: String,
    default: '+880 41-xxxxxx',
  },
}, { timestamps: true });

settingsSchema.index({ institutionId: 1, key: 1 }, { unique: true });
module.exports = mongoose.model('Settings', settingsSchema);
