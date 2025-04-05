const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  logbookWeek: {
    type: String,
    required: true,
  },

  numberOfHours: {
    type: Number,
    required: true,
  },

  task: {
    type: String,
    required: true,
  },

  challenge: {
    type: String,
    required: true,
  },

  lesson: {
    type: String,
    required: true,
  },

  csOutcomes: {
    type: [String],
    required: true,
  },

  status: {
    type: String,
    default: "submitted",
  },

  reminder: {
    type: Boolean,
    default: false, // Vinay has to change this as per his task
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
