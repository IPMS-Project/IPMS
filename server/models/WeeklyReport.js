
const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({

  studentId: {
    type: String,  // Since you are using "123456" for now
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
  },
}, { timestamps: true });


module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
