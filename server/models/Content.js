const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['event', 'news', 'publication', 'research'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
  },
  location: {
    type: String,
  },
  authors: {
    type: String,
  },
  year: {
    type: String,
  },
  category: {
    type: String,
  },
  status: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);