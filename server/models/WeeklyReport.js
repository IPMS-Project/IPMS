const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
  // studentId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },

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

  //! Temporary fields for combining reports until we use the studentid in future
  student_name: {
    type: String,
    required: true,
  },
  groupNumber: {
    type: Number,
    required: true,
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
