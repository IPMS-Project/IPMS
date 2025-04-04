const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasksPerformed: {
    type: String,
    required: true
  },
  challengesFaced: {
    type: String,
    required: true
  },
  lessonsLearned: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed'],
    default: 'draft'
  },
  csOutcomes: {
    type: [String],
    default: []
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
