const Submission = require("../models/Submission");
const InternshipRequest = require("../models/InternshipRequest");
const EmailService = require("../services/emailService");

// 🔹 Supervisor Routes
const getPendingSubmissions = async (req, res) => {
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

const approveSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      { supervisor_status: "Approved", supervisor_comment: comment || "" },
      { new: true }
    );
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission Approved", updatedSubmission: submission });
  } catch (err) {
    res.status(500).json({ message: "Approval Failed", error: err });
  }
};

const rejectSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const submission = await Submission.findByIdAndUpdate(
      id,
      { supervisor_status: "Rejected", supervisor_comment: comment || "" },
      { new: true }
    );
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission Rejected", updatedSubmission: submission });
  } catch (err) {
    res.status(500).json({ message: "Rejection Failed", error: err });
  }
};

// 🔹 Coordinator Routes
const getCoordinatorRequests = async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      status: "pending",
    }).populate("student", "userName email");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

const getCoordinatorRequestDetails = async (req, res) => {
  try {
    const requestData = await InternshipRequest.findById(req.params.id)
      .populate("student", "userName email")
      .lean();

    if (!requestData) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 🔍 Find related submission
    const submission = await Submission.findOne({ form_id: req.params.id });
    const supervisorStatus = submission?.supervisor_status || "Not Submitted";

    res.status(200).json({ requestData, supervisorStatus });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
};

const coordinatorApproveRequest = async (req, res) => {
  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("student", "userName email");

    if (!request) return res.status(404).json({ message: "Request not found" });

    // ✅ Update Submission: coordinator_status
    await Submission.findOneAndUpdate(
      { form_id: req.params.id },
      {
        coordinator_status: "Approved",
        coordinator_comment: "Approved by Coordinator",
      }
    );

    await EmailService.sendEmail({
      to: request.student.email,
      subject: "Internship Request Approved",
      html: `<p>Your internship request has been approved by the Coordinator.</p>`,
    });

    res.json({ message: "Request Approved Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
};

const coordinatorRejectRequest = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Reason required" });

  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("student", "userName email");

    if (!request) return res.status(404).json({ message: "Request not found" });

    // ✅ Update Submission: coordinator_status and comment
    await Submission.findOneAndUpdate(
      { form_id: req.params.id },
      {
        coordinator_status: "Rejected",
        coordinator_comment: reason,
      }
    );

    await EmailService.sendEmail({
      to: request.student.email,
      subject: "Internship Request Rejected",
      html: `<p>Your internship request has been rejected.<br>Reason: ${reason}</p>`,
    });

    res.json({ message: "Request Rejected Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
};

const coordinatorResendRequest = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    submission.coordinator_reminder_count = 0;
    submission.last_coordinator_reminder_at = new Date();
    submission.coordinator_status = "pending";

    await submission.save();

    return res.status(200).json({
      message: "Coordinator review has been reset. Reminder cycle restarted.",
    });
  } catch (error) {
    console.error("Error in coordinatorResendRequest:", error);
    return res
      .status(500)
      .json({ message: "Server error while resending request." });
  }
};

const deleteStalledSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found." });

    if (submission.coordinator_status !== "pending") {
      return res.status(400).json({
        message: "Cannot delete a submission that has already been reviewed.",
      });
    }

    await Submission.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Submission deleted successfully." });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStudentSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const submission = await Submission.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found." });

    if (submission.student_id.toString() !== studentId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this submission." });
    }

    if (submission.coordinator_status !== "pending") {
      return res
        .status(400)
        .json({ message: "Submission already reviewed. Cannot delete." });
    }

    await Submission.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Submission successfully deleted by student." });
  } catch (err) {
    console.error("Error deleting student submission:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getStudentSubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const submissions = await Submission.find({ student_id: studentId }).sort({
      createdAt: -1,
    });
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

console.log(
  "DEBUG check - getStudentSubmissions:",
  typeof getStudentSubmissions
);

module.exports = {
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  coordinatorResendRequest,
  deleteStalledSubmission,
  deleteStudentSubmission,
  getStudentSubmissions,
};
