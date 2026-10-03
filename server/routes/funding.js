const express = require('express');
const multer = require('multer');
const router = express.Router();
const FundedProject = require('../models/FundedProject');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

function requireOfficer(req, res, next) {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Only officers can access this' });
  }
  next();
}

// POST create a funded project with custom installments (officer only)
router.post('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { proposalId, totalAmount, installments } = req.body;

    if (!installments || !Array.isArray(installments) || installments.length === 0) {
      return res.status(400).json({ message: 'At least one installment is required' });
    }
    const percentSum = installments.reduce((sum, i) => sum + Number(i.percent), 0);
    if (percentSum !== 100) {
      return res.status(400).json({ message: 'Installment percentages must add up to 100' });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    if (proposal.status !== 'Accepted') {
      return res.status(400).json({ message: 'Only accepted proposals can be funded' });
    }

    const existing = await FundedProject.findOne({ proposal: proposalId });
    if (existing) {
      return res.status(400).json({ message: 'This proposal already has a funding record' });
    }

    const year = new Date().getFullYear();
    const count = await FundedProject.countDocuments();
    const fundingNumber = `KURIC-FUND-${year}-${String(count + 1).padStart(3, '0')}`;

    const preparedInstallments = installments.map((i, idx) => ({
      label: i.label,
      percent: Number(i.percent),
      amount: Math.round((totalAmount * Number(i.percent)) / 100),
      dueMonths: Number(i.dueMonths) || 0,
      reportRequired: idx === 0 ? false : i.reportRequired !== false,
      status: idx === 0 ? 'Released' : 'Pending',
      releasedAt: idx === 0 ? new Date() : null,
    }));

    const project = await FundedProject.create({
      proposal: proposalId,
      researcher: proposal.researcher,
      fundingNumber,
      totalAmount,
      installments: preparedInstallments,
    });

    await Notification.create({
      user: proposal.researcher,
      message: `Your proposal "${proposal.title}" has been funded! Funding number: ${fundingNumber}`,
      link: `/proposals/funded/${project._id}`,
    });

    res.status(201).json({ message: 'Funding created', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating funding' });
  }
});

router.get('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const projects = await FundedProject.find()
      .populate('researcher', 'name email department')
      .populate('proposal', 'title')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching funded projects' });
  }
});

router.get('/eligible-proposals', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const funded = await FundedProject.find().select('proposal');
    const fundedIds = funded.map((f) => f.proposal.toString());

    const eligible = await Proposal.find({ status: 'Accepted' })
      .populate('researcher', 'name email')
      .then((list) => list.filter((p) => !fundedIds.includes(p._id.toString())));

    res.json({ proposals: eligible });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching eligible proposals' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await FundedProject.findById(req.params.id)
      .populate('researcher', 'name email department')
      .populate('proposal', 'title abstract');

    if (!project) {
      return res.status(404).json({ message: 'Funded project not found' });
    }
    if (
      req.user.role !== 'officer' &&
      project.researcher._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to view this' });
    }

    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

router.get('/mine/list', authMiddleware, async (req, res) => {
  try {
    const projects = await FundedProject.find({ researcher: req.user.id })
      .populate('proposal', 'title')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching your projects' });
  }
});

// POST researcher submits a report for a specific installment
router.post(
  '/:id/installments/:installmentId/report',
  authMiddleware,
  upload.single('reportFile'),
  async (req, res) => {
    try {
      const project = await FundedProject.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Funded project not found' });
      }
      if (project.researcher.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const installment = project.installments.id(req.params.installmentId);
      if (!installment) {
        return res.status(404).json({ message: 'Installment not found' });
      }

      installment.reportText = req.body.reportText || '';
      if (req.file) installment.reportFile = req.file.filename;
      installment.status = 'Report Submitted';
      installment.submittedAt = new Date();
      await project.save();

      const officers = await User.find({ role: 'officer' });
      await Notification.insertMany(
        officers.map((o) => ({
          user: o._id,
          message: `Report submitted for "${installment.label}" — ${project.fundingNumber}`,
          link: `/officer/funding/${project._id}`,
        }))
      );

      res.json({ message: 'Report submitted', project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error submitting report' });
    }
  }
);

// PATCH officer releases an installment (after reviewing report, or directly for ones with no report required)
router.patch(
  '/:id/installments/:installmentId/release',
  authMiddleware,
  requireOfficer,
  async (req, res) => {
    try {
      const project = await FundedProject.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Funded project not found' });
      }

      const installment = project.installments.id(req.params.installmentId);
      if (!installment) {
        return res.status(404).json({ message: 'Installment not found' });
      }

      installment.status = 'Released';
      installment.releasedAt = new Date();
      await project.save();

      const allReleased = project.installments.every((i) => i.status === 'Released');
      if (allReleased) {
        project.projectStatus = 'Completed';
        await project.save();
      }

      await Notification.create({
        user: project.researcher,
        message: `"${installment.label}" (৳${installment.amount.toLocaleString()}) released for ${project.fundingNumber}`,
        link: `/proposals/funded/${project._id}`,
      });

      res.json({ message: 'Installment released', project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error releasing installment' });
    }
  }
);

// PATCH officer adds a new installment to an existing project (flexibility for mid-project changes)
router.patch('/:id/installments', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { label, percent, dueMonths, reportRequired } = req.body;
    const project = await FundedProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Funded project not found' });
    }

    project.installments.push({
      label,
      percent: Number(percent),
      amount: Math.round((project.totalAmount * Number(percent)) / 100),
      dueMonths: Number(dueMonths) || 0,
      reportRequired: reportRequired !== false,
      status: 'Pending',
    });
    await project.save();

    res.json({ message: 'Installment added', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding installment' });
  }
});

router.patch('/:id/publication', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { publicationStatus, journalName, publicationLink } = req.body;
    const project = await FundedProject.findByIdAndUpdate(
      req.params.id,
      { publicationStatus, journalName, publicationLink },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Funded project not found' });
    }
    res.json({ message: 'Publication info updated', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating publication info' });
  }
});

router.patch('/:id/amount', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { totalAmount } = req.body;
    const project = await FundedProject.findByIdAndUpdate(
      req.params.id,
      { totalAmount },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Funded project not found' });
    }
    res.json({ message: 'Amount updated', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating amount' });
  }
});

module.exports = router;