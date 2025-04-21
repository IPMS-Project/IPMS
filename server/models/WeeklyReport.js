const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
  studentId: {
    type: String,
    //ref: "User",
    required: true,
  },

  email: {
    type: String,
    required: true,
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
