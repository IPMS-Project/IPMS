const mongoose = require('mongoose');
const formMetadata = require('./FormMetadata');

// Signature schema for both advisor and coordinator
const signatureSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'draw'],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  font: {
    type: String // used only if type is 'text'
  }
}, { _id: false });

// Individual evaluation item schema
const evaluationItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  rating: {
    type: String,
    enum: ['Satisfactory', 'Unsatisfactory'],
    required: true
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, { _id: false });

// Main evaluation schema
const evaluationSchema = new mongoose.Schema({
  ...formMetadata,

  interneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: false
  },

  interneeName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  interneeID: {
    type: String,
    required: true,
    match: [/^\d{9}$/, 'Sooner ID must be a 9-digit number']
  },

  interneeEmail: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    lowercase: true,
    trim: true
  },

  evaluations: {
    type: [evaluationItemSchema],
    validate: [arr => arr.length > 0, 'At least one evaluation item is required']
  },

  advisorSignature: {
    type: signatureSchema,
    required: true
  },

  advisorAgreement: {
    type: Boolean,
    required: true
  },

  coordinatorSignature: {
    type: signatureSchema,
    required: true
  },

  coordinatorAgreement: {
    type: Boolean,
    required: true
  },

  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  },

  submittedAt: {
    type: Date
  }

}, { timestamps: true });

// Unique index to prevent duplicate submissions
evaluationSchema.index({ interneeID: 1, internshipId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
