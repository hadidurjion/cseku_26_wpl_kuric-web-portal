const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Only ${role}s can access this` });
    }
    next();
  };
}

// GET dashboard summary (counts by status)
router.get('/dashboard', authMiddleware, requireRole('officer'), async (req, res) => {
  try {
    const all = await Proposal.find();
    const counts = {
      total: all.length,
      Draft: 0,
      Pending: 0,
      'Under Review': 0,
      Accepted: 0,
      'Revision Needed': 0,
      Rejected: 0,
    };
    all.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    res.json({ counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

// GET all users (for role management)
router.get('/users', authMiddleware, requireRole('officer'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// PATCH change a user's role (assign/revoke reviewer)
router.patch('/users/:id/role', authMiddleware, requireRole('officer'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['researcher', 'reviewer', 'officer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Role updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating role' });
  }
});

module.exports = router;