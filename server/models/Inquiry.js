const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);