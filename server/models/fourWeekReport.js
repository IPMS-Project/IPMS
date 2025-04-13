const mongoose = require("mongoose");

const fourWeekReportSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  week: {
    type: String,
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
  challenges: {
    type: String,
    required: true,
  },
  supervisorComments: {
    type: String,
  },
  coordinatorComments: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("FourWeekReport", fourWeekReportSchema);
