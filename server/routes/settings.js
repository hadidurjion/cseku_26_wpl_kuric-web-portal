const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/authMiddleware');

function requireOfficer(req, res, next) {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Only officers can access this' });
  }
  next();
}

// GET homepage settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'homepage' });
    if (!settings) {
      settings = await Settings.create({ key: 'homepage' });
    }
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// PUT update homepage settings (officer only)
router.put('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { tagline, activeProjectsCount, publicationsCount, fundedAmount } =
      req.body;

    const settings = await Settings.findOneAndUpdate(
      { key: 'homepage' },
      { tagline, activeProjectsCount, publicationsCount, fundedAmount },
      { new: true, upsert: true }
    );

    res.json({ message: 'Settings updated', settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

module.exports = router;