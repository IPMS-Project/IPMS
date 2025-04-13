const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // student_name: { type: String, required: true },
    // details: { type: String, required: true },
    details: [
      {
        week: { type: String, required: true },
        hours: { type: Number, required: true },
        tasks: { type: String, required: true },
        lessons: { type: String, required: true },
        supervisorComments: { type: String, default: "" },
      },
    ],
    supervisor_status: { type: String, default: "pending" },
    supervisor_comment: { type: String, default: "" },
    coordinator_status: { type: String, default: "pending" },
    coordinator_comment: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
