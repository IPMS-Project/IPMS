const mongoose = require('mongoose');
const formMetadata = require('./FormMetadata');

const signatureSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'draw'], required: true },
  value: { type: String, required: true },
  font: { type: String }
}, { _id: false });

const evaluationItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    enum: ['Satisfactory', 'Unsatisfactory'],
    required: true
  },
  comment: { type: String, maxlength: 500 }
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  ...formMetadata,
  interneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: false },

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
    match: [/^\d{9}$/, 'Sooner ID must be a 9-digit number'] // Sooner ID validation
  },

  interneeEmail: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format'], // Email format validation
    lowercase: true,
    trim: true
  },

  evaluations: {
    type: [evaluationItemSchema],
    validate: [arr => arr.length > 0, 'At least one evaluation item is required']
  },

  supervisorSignature: { type: signatureSchema, required: true },
  supervisorAgreement: { type: Boolean, required: true },
  coordinatorSignature: { type: signatureSchema, required: true },
  coordinatorAgreement: { type: Boolean, required: true }

}, { timestamps: true });

evaluationSchema.index({ interneeID: 1, internshipId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);