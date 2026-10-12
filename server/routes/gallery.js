const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const GalleryImage = require('../models/GalleryImage');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-gal-${file.originalname.replace(/\s+/g, '_')}`),
  }),
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

function requireOfficer(req, res, next) {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Only officers can access this' });
  }
  next();
}

router.get('/', async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching gallery' });
  }
});

router.post('/', authMiddleware, requireOfficer, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please choose at least one image' });
    }
    const docs = await GalleryImage.insertMany(
      req.files.map((f) => ({
        image: f.filename,
        caption: req.body.caption || '',
        uploadedBy: req.user.id,
      }))
    );
    res.status(201).json({ message: 'Uploaded', images: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error uploading images' });
  }
});

router.delete('/:id', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const img = await GalleryImage.findByIdAndDelete(req.params.id);
    if (img) {
      fs.unlink(path.join(__dirname, '..', 'uploads', img.image), () => {});
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;