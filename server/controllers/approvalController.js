const Submission = require("../models/Submission");

// ✅ Get pending submissions for supervisor
exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: "pending" });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending submissions", error: err });
  }
};

// ✅ Supervisor Approves
exports.approveSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      { status: "approved_by_supervisor" },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({
      message: "Submission approved and forwarded to Coordinator",
      updatedSubmission: submission
    });

  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err });
  }
};

// ❌ Supervisor Rejects
exports.rejectSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      { status: "rejected_by_supervisor" },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({
      message: "Submission rejected",
      updatedSubmission: submission
    });

  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err });
  }
};