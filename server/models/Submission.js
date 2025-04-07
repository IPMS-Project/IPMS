const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  internshipDetails: { type: String, required: true },
  status: { type: String, default: "pending" },
  supervisorComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);