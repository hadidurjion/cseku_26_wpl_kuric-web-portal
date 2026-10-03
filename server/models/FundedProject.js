const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  label: { type: String, required: true },
  percent: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  dueMonths: { type: Number, default: 0 },
  reportRequired: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['Pending', 'Report Submitted', 'Released'],
    default: 'Pending',
  },
  reportText: { type: String, default: '' },
  reportFile: { type: String, default: '' },
  submittedAt: { type: Date, default: null },
  releasedAt: { type: Date, default: null },
}, { _id: true });

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
  installments: [installmentSchema],
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