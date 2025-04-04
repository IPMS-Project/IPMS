const mongoose = require('mongoose');

const formA3Schema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  evaluationScore: {
    type: String,
    enum: ['Satisfactory', 'Unsatisfactory'],
    required: true
  },
  comments: {
    type: String,
    required: true,
    trim: true
  },
  supervisorSignature: {
    type: String,
    required: true
  },
  coordinatorSignature: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('FormA3', formA3Schema);
