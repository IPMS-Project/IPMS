const Submission = require("../models/Submission");
const InternshipRequest = require("../models/InternshipRequest");
const EmailService = require("../services/emailService");

// ✅ Get pending submissions for supervisor
exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ supervisor_status: "pending" });
    res.json(submissions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch pending submissions", error: err });
  }
};

// ✅ Supervisor Approves
exports.approveSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      { supervisor_status: "Approved" },
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

// ❌ Supervisor Rejects
exports.rejectSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      { supervisor_status: "Rejected" },
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
// Coordinator: Get Request Details
exports.getCoordinatorRequestDetails = async (req, res) => {
  try {
    const requestData = await InternshipRequest.findById(
      req.params.id
    ).populate("student", "userName email");

    if (!requestData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const submissionData = await Submission.findOne({
      student_name: requestData.student.userName,
    });

    res.status(200).json({
      requestData,
      supervisorStatus: submissionData
        ? submissionData.supervisor_status
        : "Not Submitted",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details", error: err });
  }
};
