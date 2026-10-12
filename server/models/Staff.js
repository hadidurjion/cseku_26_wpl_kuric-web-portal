const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  category: { type: String, enum: ['director', 'staff'], default: 'staff' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);