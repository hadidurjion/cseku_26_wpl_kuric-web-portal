const express = require('express');
const router = express.Router();
const { askClaude } = require('../services/aiService');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// POST public chatbot
router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'A message is required' });
    }

    const systemPrompt = `You are KURIC Assistant, a helpful assistant for the Khulna University Research and Innovation Center web portal. 
Answer questions about: submitting research proposals (researchers register, then submit title/abstract/objectives/budget/timeline via the "Submit proposal" button), KURIC's research areas (ICT, Environment, Health), publications, events, and how the review process works (Officer assigns a Reviewer, who decides Accept/Revision Needed/Deny). 
Keep answers short (2-4 sentences), friendly, and specific to KURIC. If you don't know something specific, suggest visiting the Contact page.`;

    const reply = await askClaude(systemPrompt, message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI service error' });
  }
});

// GET AI summary of a proposal (reviewer only)
router.get('/summarize/:proposalId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'reviewer') {
      return res.status(403).json({ message: 'Only reviewers can access this' });
    }

    const proposal = await Proposal.findOne({
      _id: req.params.proposalId,
      reviewer: req.user.id,
    });
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const systemPrompt =
      'Summarize this research proposal in 3-4 concise sentences for a busy reviewer. Focus on the core idea, approach, and significance. Do not use markdown formatting.';
    const userMessage = `Title: ${proposal.title}\nAbstract: ${proposal.abstract}\nObjectives: ${proposal.objectives}`;

    const summary = await askClaude(systemPrompt, userMessage);
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI service error' });
  }
});

// POST AI reviewer-matching suggestion (officer only)
router.post('/match-reviewer/:proposalId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'officer') {
      return res.status(403).json({ message: 'Only officers can access this' });
    }

    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const reviewers = await User.find({ role: 'reviewer' }).select(
      'name expertise'
    );

    const systemPrompt = `You match research proposals to the most suitable reviewer based on subject expertise. 
Given a proposal and a list of reviewers with their expertise, respond with ONLY valid JSON in this exact format, no other text: 
{"suggestions": [{"name": "reviewer name", "matchPercent": 85, "reason": "short reason"}]}
Return the top 3 matches (or fewer if fewer reviewers exist), ranked by relevance.`;

    const userMessage = `Proposal title: ${proposal.title}\nAbstract: ${proposal.abstract}\n\nReviewers:\n${reviewers
      .map((r) => `- ${r.name}: expertise = ${r.expertise || 'not specified'}`)
      .join('\n')}`;

    const raw = await askClaude(systemPrompt, userMessage);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI service error' });
  }
});

// POST AI automated report generator (officer only)
router.post('/generate-report', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'officer') {
      return res.status(403).json({ message: 'Only officers can access this' });
    }

    const proposals = await Proposal.find().populate('researcher', 'department');

    const total = proposals.length;
    const byStatus = {};
    const byDept = {};
    proposals.forEach((p) => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      const dept = p.researcher?.department || 'Unknown';
      byDept[dept] = (byDept[dept] || 0) + 1;
    });

    const systemPrompt =
      'Write a short narrative progress report (3-4 paragraphs) for KURIC leadership summarizing proposal activity. Highlight trends, not just raw numbers. Plain text, no markdown headers.';
    const userMessage = `Total proposals: ${total}\nBy status: ${JSON.stringify(
      byStatus
    )}\nBy department: ${JSON.stringify(byDept)}`;

    const report = await askClaude(systemPrompt, userMessage);
    res.json({ report, stats: { total, byStatus, byDept } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI service error' });
  }
});

module.exports = router;