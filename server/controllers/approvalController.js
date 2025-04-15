const Submission = require("../models/Submission");

// ✅ Get all pending submissions for the supervisor
exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ supervisor_status: "pending" });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending submissions",
      error: err.message,
    });
  }
};

// ✅ Supervisor Approves a submission
exports.approveSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const InternshipRequest = require("../models/InternshipRequest");
    const submission = await InternshipRequest.findByIdAndUpdate(
      id,
      {
        supervisor_status: "Approved",
        supervisor_comment: comment || "",
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({
      message: "Submission approved and forwarded to Coordinator",
      updatedSubmission: submission,
    });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err });
  }
};

// ✅ Supervisor Rejects a submission
exports.rejectSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        supervisor_status: "Rejected",
        supervisor_comment: comment || "",
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({
      message: "Submission rejected",
      updatedSubmission: submission,
    });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err });
  }
};
