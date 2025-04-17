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

  evaluations: {
    type: [evaluationItemSchema],
    validate: [arr => arr.length > 0, 'At least one evaluation item is required']
  },

  advisorSignature: { type: signatureSchema, required: true },
  advisorAgreement: { type: Boolean, required: true },
  coordinatorSignature: { type: signatureSchema, required: true },
  coordinatorAgreement: { type: Boolean, required: true }

}, { timestamps: true });

evaluationSchema.index({ interneeId: 1, internshipId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
