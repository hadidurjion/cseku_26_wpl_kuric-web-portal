const mongoose = require('mongoose');

const fundedProjectSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  researcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fundingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  initialPercent: {
    type: Number,
    default: 50,
  },
  initialDisbursed: {
    type: Number,
    default: 0,
  },
  sixMonthDisbursed: {
    type: Number,
    default: 0,
  },
  disbursementStatus: {
    type: String,
    enum: [
      'Initial Released',
      'Awaiting 6-month Report',
      '6-month Approved',
      'Fully Disbursed',
    ],
    default: 'Initial Released',
  },
  sixMonthReportText: {
    type: String,
    default: '',
  },
  sixMonthReportFile: {
    type: String,
    default: '',
  },
  sixMonthReportStatus: {
    type: String,
    enum: ['Not Submitted', 'Submitted', 'Approved'],
    default: 'Not Submitted',
  },
  sixMonthSubmittedAt: {
    type: Date,
    default: null,
  },
  oneYearReportText: {
    type: String,
    default: '',
  },
  oneYearReportFile: {
    type: String,
    default: '',
  },
  oneYearReportStatus: {
    type: String,
    enum: ['Not Submitted', 'Submitted', 'Approved'],
    default: 'Not Submitted',
  },
  oneYearSubmittedAt: {
    type: Date,
    default: null,
  },
  publicationStatus: {
    type: String,
    enum: ['Not Published', 'Under Review', 'Published'],
    default: 'Not Published',
  },
  journalName: {
    type: String,
    default: '',
  },
  publicationLink: {
    type: String,
    default: '',
  },
  projectStatus: {
    type: String,
    enum: ['Active', 'Completed', 'Discontinued'],
    default: 'Active',
  },
}, { timestamps: true });

module.exports = mongoose.model('FundedProject', fundedProjectSchema);