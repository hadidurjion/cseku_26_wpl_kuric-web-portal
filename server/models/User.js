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
    expertise: {
    type: String,
  },
    active: {
    type: Boolean,
    default: true,
  },
    bio: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);