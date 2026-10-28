const express = require('express');
const bcrypt = require('bcryptjs');
const Institution = require('../models/Institution');
const User = require('../models/User');

const router = express.Router();
const RESERVED = ['api', 'admin', 'www', 'login', 'register', 'superadmin'];

// Public: list of active RICs
router.get('/', async (req, res) => {
  try {
    const list = await Institution.find({ status: 'Active' })
      .select('name shortName slug logo primaryColor tagline')
      .sort({ name: 1 });
    res.json({ institutions: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: branding info for one RIC
router.get('/:slug', async (req, res) => {
  try {
    const inst = await Institution.findOne({
      slug: req.params.slug.toLowerCase(),
      status: 'Active',
    }).select('-directorEmail');
    if (!inst) return res.status(404).json({ message: 'Institution not found' });
    res.json({ institution: inst });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: request a new RIC (stays Pending until Super Admin approves)
router.post('/register', async (req, res) => {
  let inst = null;
  try {
    const { name, shortName, slug, directorName, directorEmail, password, primaryColor, tagline } = req.body;
    if (!name || !shortName || !slug || !directorName || !directorEmail || !password) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    const s = String(slug).toLowerCase().trim();
    if (!/^[a-z0-9-]{2,20}$/.test(s) || RESERVED.includes(s)) {
      return res.status(400).json({ message: 'Short address must be 2-20 letters, numbers or hyphens' });
    }
    if (await Institution.findOne({ slug: s })) {
      return res.status(400).json({ message: 'This short address is already taken' });
    }

    inst = await Institution.create({
      name, shortName, slug: s, tagline, directorEmail,
      primaryColor: primaryColor || undefined,
      status: 'Pending',
    });
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name: directorName,
      email: directorEmail,
      password: hashed,
      role: 'officer',
      institutionId: inst._id,
    });

    res.status(201).json({ message: 'Request submitted. You can log in after approval.' });
  } catch (err) {
    if (inst) await Institution.findByIdAndDelete(inst._id).catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Server error during institution registration' });
  }
});

module.exports = router;

