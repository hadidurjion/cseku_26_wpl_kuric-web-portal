const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/authMiddleware');
const Proposal = require('../models/Proposal');
const FundedProject = require('../models/FundedProject');
const Content = require('../models/Content');

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
      settings = await Settings.create(await tenantDefaults(req));
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
    const {
      tagline,
      activeProjectsCount,
      publicationsCount,
      fundedAmount,
      aboutMission,
      directorName,
      directorTitle,
      contactEmail,
      contactAddress,
      contactPhone,
    } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { key: 'homepage' },
      {
        tagline,
        activeProjectsCount,
        publicationsCount,
        fundedAmount,
        aboutMission,
        directorName,
        directorTitle,
        contactEmail,
        contactAddress,
        contactPhone,
      },
      { new: true, upsert: true }
    );

    res.json({ message: 'Settings updated', settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});
// GET live homepage statistics (public)
router.get('/stats', async (req, res) => {
  try {
    const [totalProposals, underReview, accepted, publications, funded] =
      await Promise.all([
        Proposal.countDocuments({ status: { $ne: 'Draft' } }),
        Proposal.countDocuments({ status: 'Under Review' }),
        Proposal.countDocuments({ status: 'Accepted' }),
        Content.countDocuments({ type: 'publication' }),
        FundedProject.find(),
      ]);

    const activeProjects = funded.filter((f) => f.projectStatus === 'Active').length;
    const fundedAmount = funded.reduce(
      (sum, f) =>
        sum +
        f.installments
          .filter((i) => i.status === 'Released')
          .reduce((s, i) => s + (i.amount || 0), 0),
      0
    );

    res.json({ totalProposals, underReview, accepted, activeProjects, publications, fundedAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;

async function tenantDefaults(req) {
  const Institution = require('../models/Institution');
  const inst = await Institution.findById(req.institutionId).lean();
  if (!inst) return { key: 'homepage' };
  const uni = String(inst.name).replace(/\s+(Research.*|RIC)$/i, '') || inst.name;
  return {
    key: 'homepage',
    aboutMission: `We advance research culture at ${uni} by supporting proposal development, funding pathways and research outputs.`,
    directorTitle: `Director, ${inst.shortName}RIC`,
    contactEmail: inst.directorEmail || '',
    contactAddress: `${uni}, Bangladesh`,
    directorName: 'Director',
    contactPhone: '-',
    activeProjectsCount: '0',
    publicationsCount: '0',
    fundedAmount: '0',
    directorName: 'Director',
    contactPhone: '-',
    activeProjectsCount: '0',
    publicationsCount: '0',
    fundedAmount: '0',
  };
}


