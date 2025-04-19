const mongoose = require("mongoose");
const formMetadata = require("./FormMetadata");

const weeklyReportSchema = new mongoose.Schema({

  ...formMetadata,
    
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

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
