const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  soonerId: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  supervisorName: {
    type: String,
    default: "",
  },
  supervisorEmail: {
    type: String,
    default: "",
  },
  coordinatorName: {
    type: String,
    default: "",
  },
  coordinatorEmail: {
    type: String,
    default: "",
  },
  week: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  tasks: {
    type: String,
    required: true,
  },
  lessons: {
    type: String,
    required: true,
  },
  supervisorComments: {
    type: String,
    default: "",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
