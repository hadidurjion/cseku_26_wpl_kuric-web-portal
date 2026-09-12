const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const authMiddleware = require('../middleware/authMiddleware');

function requireOfficer(req, res, next) {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Only officers can access this' });
  }
  next();
}

// GET all content (optionally filter by type) - public
router.get('/', async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await Content.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

// POST create content (officer only)
router.post('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const item = await Content.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ message: 'Content created', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating content' });
  }
});

// PUT update content (officer only)
router.put('/:id', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const item = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content updated', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating content' });
  }
});

// DELETE content (officer only)
router.delete('/:id', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const item = await Content.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting content' });
  }
});

// GET global search across all content types
router.get('/search/:query', async (req, res) => {
  try {
    const q = req.params.query;
    const items = await Content.find({
      title: { $regex: q, $options: 'i' },
    }).limit(15);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error searching content' });
  }
});
module.exports = router;