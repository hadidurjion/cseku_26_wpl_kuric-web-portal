const express = require('express');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Proposal = require('../models/Proposal');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware, (req, res, next) =>
  req.user.role === 'superadmin' ? next() : res.status(403).json({ message: 'Super Admin only' })
);

// List all RICs with counts
router.get('/institutions', async (req, res) => {
  try {
    const list = await Institution.find().sort({ createdAt: -1 }).lean();
    const institutions = await Promise.all(
      list.map(async (i) => ({
        ...i,
        users: await User.countDocuments({ institutionId: i._id }),
        proposals: await Proposal.countDocuments({ institutionId: i._id }),
      }))
    );
    res.json({ institutions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve / reject / suspend / reactivate
router.patch('/institutions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Rejected', 'Suspended', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (String(req.params.id) === String(req.institutionId) && status !== 'Active') {
      return res.status(400).json({ message: 'You cannot deactivate your own institution' });
    }
    const inst = await Institution.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inst) return res.status(404).json({ message: 'Institution not found' });
    require('../middleware/resolveTenant').clearCache();
    res.json({ message: 'Status updated', institution: inst });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

