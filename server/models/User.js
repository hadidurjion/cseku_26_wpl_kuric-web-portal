const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['researcher', 'reviewer', 'officer'],
    default: 'researcher',
  },
  department: {
    type: String,
  },
  designation: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);