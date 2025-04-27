const mongoose = require("mongoose");
const UserTokenRequest = require("../models/TokenRequest");

const formMetadata = {
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserTokenRequest"},
  supervisor_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserTokenRequest"},
  coordinator_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserTokenRequest"},

  supervisor_status: { type: String, default: "pending" },
  supervisor_comment: String,
  supervisor_reminder_count: { type: Number, default: 0 },
  last_supervisor_reminder_at: Date,

  coordinator_status: { type: String, default: "pending" },
  coordinator_comment: String,
  coordinator_reminder_count: { type: Number, default: 0 },
  last_coordinator_reminder_at: Date,
  coordinator_responded: {type: Boolean, default: false },
  coordinator_studentNotified: {type: Boolean, default: false },
};

module.exports = formMetadata;
