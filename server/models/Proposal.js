const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  abstract: {
    type: String,
    required: true,
  },
  objectives: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
  },
  timeline: {
    type: String,
  },
  coResearchers: [
    {
      type: String,
    },
  ],
  attachments: [
    {
      filename: String,
      originalName: String,
    },
  ],
  status: {
    type: String,
    enum: [
      'Draft',
      'Pending',
      'Under Review',
      'Accepted',
      'Revision Needed',
      'Rejected',
    ],
    default: 'Draft',
  },
  researcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
    reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewDecision: {
    type: String,
    enum: ['Accept', 'Revision Needed', 'Deny', null],
    default: null,
  },
  reviewComment: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);