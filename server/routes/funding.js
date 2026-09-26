const express = require('express');
const multer = require('multer');
const router = express.Router();
const FundedProject = require('../models/FundedProject');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
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

// POST create a funded project from an accepted proposal (officer only)
router.post('/', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const { proposalId, totalAmount, initialPercent } = req.body;

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

    const percent = initialPercent || 50;
    const initialDisbursed = Math.round((totalAmount * percent) / 100);

    const project = await FundedProject.create({
      proposal: proposalId,
      researcher: proposal.researcher,
      fundingNumber,
      totalAmount,
      initialPercent: percent,
      initialDisbursed,
      disbursementStatus: 'Initial Released',
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

// GET all funded projects (officer only)
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

// GET accepted proposals that don't have funding yet (officer only)
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

// GET a single funded project (officer or the owning researcher)
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

// GET funded projects belonging to the logged-in researcher
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

// POST researcher submits 6-month report
router.post(
  '/:id/six-month-report',
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

      project.sixMonthReportText = req.body.reportText || '';
      if (req.file) project.sixMonthReportFile = req.file.filename;
      project.sixMonthReportStatus = 'Submitted';
      project.sixMonthSubmittedAt = new Date();
      project.disbursementStatus = 'Awaiting 6-month Report';
      await project.save();

      const officers = await require('../models/User').find({ role: 'officer' });
      await Notification.insertMany(
        officers.map((o) => ({
          user: o._id,
          message: `6-month report submitted for ${project.fundingNumber}`,
          link: `/officer/funding/${project._id}`,
        }))
      );

      res.json({ message: '6-month report submitted', project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error submitting report' });
    }
  }
);

// POST researcher submits 1-year report
router.post(
  '/:id/one-year-report',
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

      project.oneYearReportText = req.body.reportText || '';
      if (req.file) project.oneYearReportFile = req.file.filename;
      project.oneYearReportStatus = 'Submitted';
      project.oneYearSubmittedAt = new Date();
      await project.save();

      const officers = await require('../models/User').find({ role: 'officer' });
      await Notification.insertMany(
        officers.map((o) => ({
          user: o._id,
          message: `1-year report submitted for ${project.fundingNumber}`,
          link: `/officer/funding/${project._id}`,
        }))
      );

      res.json({ message: '1-year report submitted', project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error submitting report' });
    }
  }
);

// PATCH officer approves 6-month report and releases remaining funds
router.patch('/:id/approve-six-month', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const project = await FundedProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Funded project not found' });
    }

    project.sixMonthReportStatus = 'Approved';
    const remaining = project.totalAmount - project.initialDisbursed;
    project.sixMonthDisbursed = remaining;
    project.disbursementStatus = '6-month Approved';
    await project.save();

    await Notification.create({
      user: project.researcher,
      message: `Your 6-month report for ${project.fundingNumber} was approved. Remaining funds released.`,
      link: `/proposals/funded/${project._id}`,
    });

    res.json({ message: '6-month report approved, funds released', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error approving report' });
  }
});

// PATCH officer approves 1-year report (marks project completed)
router.patch('/:id/approve-one-year', authMiddleware, requireOfficer, async (req, res) => {
  try {
    const project = await FundedProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Funded project not found' });
    }

    project.oneYearReportStatus = 'Approved';
    project.disbursementStatus = 'Fully Disbursed';
    project.projectStatus = 'Completed';
    await project.save();

    await Notification.create({
      user: project.researcher,
      message: `Your 1-year report for ${project.fundingNumber} was approved. Project marked complete.`,
      link: `/proposals/funded/${project._id}`,
    });

    res.json({ message: '1-year report approved, project completed', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error approving report' });
  }
});

// PATCH officer updates publication info
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

// PATCH officer adjusts total amount
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
