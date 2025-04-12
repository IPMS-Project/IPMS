const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  student_name: { type: String, required: true },
  details: { type: String, required: true },
  // Supervisor fields
  supervisor_status: { type: String, default: "pending" },
  supervisor_comment: { type: String },
  supervisor_reminder_count: { type: Number, default: 0 },
  last_supervisor_reminder_at: { type: Date },
  // Coordinator fields
  coordinator_status: { type: String, default: "pending" },
  coordinator_comment: { type: String },
  coordinator_reminder_count: { type: Number, default: 0 },
  last_coordinator_reminder_at: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
