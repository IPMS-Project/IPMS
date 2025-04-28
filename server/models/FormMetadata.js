const mongoose = require("mongoose");
const UserTokenRequest = require("../models/TokenRequest");

const formMetadata = {
  supervisor_status: { type: String, default: "pending" },
    supervisor_comment: String,
    supervisor_signature: String,
  supervisor_reminder_count: { type: Number, default: 0 },
  last_supervisor_reminder_at: Date,

  coordinator_status: { type: String, default: "pending" },
  coordinator_comment: String,
  coordinator_reminder_count: { type: Number, default: 0 },
  last_coordinator_reminder_at: Date,
};

module.exports = formMetadata;
