const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
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

  supervisor_status: {
    type: String,
    default: "pending", // ✅ This will allow updates
  },

  coordinator_status: {
    type: String,
    default: "not_required", // ✅ Used when form is approved
  },

  form_type: {
    type: String,
    default: "A2", // ✅ So GET filters can work
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
