const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  student_name: { type: String, required: true },
  details: { type: String, required: true },
  supervisor_status: { type: String, default: "pending" },
  supervisor_comment: { type: String },
  coordinator_status: { type: String, default: "pending" },
  coordinator_comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
