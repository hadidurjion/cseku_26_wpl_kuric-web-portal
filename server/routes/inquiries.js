const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const User = require('../models/User');

function requireOfficer(req, res, next) {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Only officers can access this' });
  }
  next();
}

// POST a new contact inquiry (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const inquiry = await Inquiry.create({ name, email, message });
    const officers = await User.find({ role: 'officer' });
    await Notification.insertMany(
      officers.map((o) => ({
        user: o._id,
        message: `New contact inquiry from ${name}`,
        link: `/officer/inquiries`,
      }))
    );
    res.status(201).json({ message: 'Inquiry received', inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting inquiry' });
  }
});

// GET all inquiries (officer only)
router.get('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ inquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching inquiries' });
  }
});

module.exports = router;