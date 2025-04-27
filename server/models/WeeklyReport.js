const mongoose = require("mongoose");
const formMetadata = require("./FormMetadata");

const weeklyReportSchema = new mongoose.Schema({
  ...formMetadata,

  studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTokenRequest",
    required: true,
  },

  // New Fields from A1
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  supervisorName: {
    type: String,
    required: true,
  },

  supervisorEmail: {
    type: String,
    required: true,
  },

  // Fixed Coordinator Info
  coordinatorName: {
    type: String,
    default: "Naveena",
  },

  coordinatorEmail: {
    type: String,
    default: "naveena.suddapalli-1@ou.edu",
  },

  // Report Data
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

  coordinatorComments: {
    type: String,
    default: "",
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
