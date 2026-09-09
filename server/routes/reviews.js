const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Small helper to check role
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Only ${role}s can access this` });
    }
    next();
  };
}

// GET all reviewers (for officer's assignment dropdown)
router.get('/reviewers', authMiddleware, requireRole('officer'), async (req, res) => {
  try {
    const reviewers = await User.find({ role: 'reviewer' }).select('-password');
    res.json({ reviewers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reviewers' });
  }
});

// GET all proposals (officer's overview dashboard)
router.get('/all-proposals', authMiddleware, requireRole('officer'), async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate('researcher', 'name email department')
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ proposals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching proposals' });
  }
});

// PATCH assign a reviewer to a proposal (officer only)
router.patch('/assign/:proposalId', authMiddleware, requireRole('officer'), async (req, res) => {
  try {
    const { reviewerId } = req.body;
    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }

    const reviewer = await User.findOne({ _id: reviewerId, role: 'reviewer' });
    if (!reviewer) {
      return res.status(400).json({ message: 'Invalid reviewer' });
    }

        const proposal = await Proposal.findByIdAndUpdate(
      req.params.proposalId,
      { reviewer: reviewerId, status: 'Under Review' },
      { new: true }
    ).populate('reviewer', 'name email');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    await Notification.create({
      user: reviewerId,
      message: `You have been assigned to review "${proposal.title}"`,
      link: `/reviewer/${proposal._id}`,
    });

    res.json({ message: 'Reviewer assigned', proposal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error assigning reviewer' });
  }
});

// GET proposals assigned to the logged-in reviewer
router.get('/assigned', authMiddleware, requireRole('reviewer'), async (req, res) => {
  try {
    const proposals = await Proposal.find({ reviewer: req.user.id })
      .populate('researcher', 'name email department')
      .sort({ createdAt: -1 });
    res.json({ proposals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching assigned proposals' });
  }
});

// GET single proposal detail (reviewer viewing full content)
router.get('/proposal/:id', authMiddleware, requireRole('reviewer'), async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      reviewer: req.user.id,
    }).populate('researcher', 'name email department');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found or not assigned to you' });
    }

    res.json({ proposal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching proposal' });
  }
});

// POST a review decision (reviewer only)
router.post('/decide/:id', authMiddleware, requireRole('reviewer'), async (req, res) => {
  try {
    const { decision, comment } = req.body;
    const validDecisions = ['Accept', 'Revision Needed', 'Deny'];

    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision value' });
    }
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'A comment is required with every decision' });
    }

    const statusMap = {
      Accept: 'Accepted',
      'Revision Needed': 'Revision Needed',
      Deny: 'Rejected',
    };

        const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, reviewer: req.user.id },
      {
        reviewDecision: decision,
        reviewComment: comment,
        reviewedAt: new Date(),
        status: statusMap[decision],
      },
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found or not assigned to you' });
    }

    await Notification.create({
      user: proposal.researcher,
      message: `Your proposal "${proposal.title}" was marked "${statusMap[decision]}"`,
      link: `/proposals`,
    });

    res.json({ message: 'Decision recorded', proposal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error recording decision' });
  }
});

module.exports = router;