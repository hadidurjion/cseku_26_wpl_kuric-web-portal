const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const authMiddleware = require('../middleware/authMiddleware');

function requireOfficer(req, res, next) {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Only officers can access this' });
  }
  next();
}

// Public: everyone (current + past)
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ startDate: -1 });
    res.json({ staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching staff' });
  }
});

// Officer: add a person. A new current director automatically ends the previous one.
router.post('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { name, designation, email, phone, category, startDate, endDate } = req.body;
    if (!name || !designation) {
      return res.status(400).json({ message: 'Name and designation are required' });
    }
    const start = startDate ? new Date(startDate) : new Date();

    if (category === 'director' && !endDate) {
      await Staff.updateMany(
        { category: 'director', endDate: null },
        { endDate: start }
      );
    }

    const member = await Staff.create({
      name,
      designation,
      email: email || '',
      phone: phone || '',
      category: category || 'staff',
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
    });
    res.status(201).json({ message: 'Added', member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding staff' });
  }
});

// Officer: end someone's tenure (moves them to history)
router.patch('/:id/end', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const end = req.body.endDate ? new Date(req.body.endDate) : new Date();
    const member = await Staff.findByIdAndUpdate(req.params.id, { endDate: end }, { new: true });
    if (!member) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Tenure ended', member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, requireOfficer, async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;