const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Proposal = require('../models/Proposal');
const authMiddleware = require('../middleware/authMiddleware');

// Multer setup — files saved to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// CREATE proposal (draft or submit)
router.post(
  '/',
  authMiddleware,
  upload.array('attachments', 5),
  async (req, res) => {
    try {
      const { title, abstract, objectives, budget, timeline, coResearchers, isDraft } =
        req.body;

      if (!title || !abstract || !objectives) {
        return res
          .status(400)
          .json({ message: 'Title, abstract and objectives are required' });
      }

      const attachments = (req.files || []).map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
      }));

      // coResearchers comes as a JSON string from FormData
      let coResearchersArr = [];
      if (coResearchers) {
        try {
          coResearchersArr = JSON.parse(coResearchers);
        } catch {
          coResearchersArr = [];
        }
      }

      const proposal = await Proposal.create({
        title,
        abstract,
        objectives,
        budget,
        timeline,
        coResearchers: coResearchersArr,
        attachments,
        status: isDraft === 'true' ? 'Draft' : 'Pending',
        researcher: req.user.id,
      });

      res.status(201).json({ message: 'Proposal saved', proposal });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error while saving proposal' });
    }
  }
);

// GET all proposals of the logged-in researcher
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const proposals = await Proposal.find({ researcher: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ proposals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching proposals' });
  }
});

module.exports = router;
// PATCH resubmit a revised proposal (researcher only, must own it)
router.patch('/:id/resubmit', authMiddleware, async (req, res) => {
  try {
    const { title, abstract, objectives, budget, timeline } = req.body;

    const proposal = await Proposal.findOne({
      _id: req.params.id,
      researcher: req.user.id,
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    if (proposal.status !== 'Revision Needed') {
      return res
        .status(400)
        .json({ message: 'Only proposals marked "Revision Needed" can be resubmitted' });
    }

    if (title) proposal.title = title;
    if (abstract) proposal.abstract = abstract;
    if (objectives) proposal.objectives = objectives;
    if (budget) proposal.budget = budget;
    if (timeline) proposal.timeline = timeline;

    proposal.status = 'Under Review';
    proposal.reviewDecision = null;

    await proposal.save();

    res.json({ message: 'Proposal resubmitted', proposal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resubmitting proposal' });
  }
});
