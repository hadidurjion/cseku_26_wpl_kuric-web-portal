const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['researcher', 'reviewer', 'officer', 'superadmin'],
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
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  researchInterests: { type: String, default: '' },
  profileLink: { type: String, default: '' },
}, { timestamps: true });

userSchema.index({ institutionId: 1, email: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);
