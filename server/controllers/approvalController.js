const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const EmailService = require("../services/emailService");

// =======================================
//         Student-Side Controllers
// =======================================

const getStudentSubmissions = async (req, res) => {
  try {
    const studentEmail = req.user.ouEmail;
    const submissions = await InternshipRequest.find({
      "student.email": studentEmail,
    }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

const deleteStudentSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await InternshipRequest.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found." });

    if (submission.student.email !== req.user.ouEmail) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this submission." });
    }

    if (submission.coordinator_status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot delete reviewed submission." });
    }

    await InternshipRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Submission deleted successfully." });
  } catch (err) {
    console.error("Error deleting student submission:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getPendingSubmissions = async (req, res) => {
  try {
    const pendingRequests = await InternshipRequest.find({
      supervisor_status: "pending",
    });
    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error("Error fetching pending submissions:", err);
    res.status(500).json({ message: "Failed to fetch pending submissions." });
  }
};

const approveSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      id,
      { supervisor_status: "approved", supervisor_comment: comment || "" },
      { new: true }
    );
    if (!request)
      return res.status(404).json({ message: "Submission not found." });

    res.json({ message: "Submission approved", updated: request });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

const rejectSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      id,
      { supervisor_status: "rejected", supervisor_comment: comment || "" },
      { new: true }
    );
    if (!request)
      return res.status(404).json({ message: "Submission not found." });

    res.json({ message: "Submission rejected", updated: request });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};

const deleteStalledSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await InternshipRequest.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found." });

    if (submission.coordinator_status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot delete reviewed submission." });
    }

    await InternshipRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Submission deleted successfully." });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================================
//         Coordinator-Side Controllers
// =======================================

const getCoordinatorRequests = async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      coordinator_status: "pending",
      "approvals.0": "advisor",
      csValidationPassed: true,
    }).populate("student", "userName email");

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching coordinator requests:", err);
    res.status(500).json({ message: "Failed to fetch internship requests." });
  }
};

const getCoordinatorRequestDetails = async (req, res) => {
  try {
    const requestData = await InternshipRequest.findById(req.params.id).lean();
    if (!requestData)
      return res.status(404).json({ message: "Request not found." });

    const supervisorStatus = requestData.supervisor_status || "Not Submitted";
    res.status(200).json({ requestData, supervisorStatus });
  } catch (err) {
    console.error("Error fetching coordinator request details:", err);
    res.status(500).json({ message: "Failed to fetch request details." });
  }
};

const coordinatorApproveRequest = async (req, res) => {
  try {
    const request = await InternshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.status = "approved";
    request.coordinator_status = "Approved";
    request.coordinator_comment = "Approved by Coordinator";
    await request.save();

    if (request.student?.email) {
      try {
        await EmailService.sendEmail({
          to: request.student.email,
          subject: "Internship Request Approved",
          html: `<p>Your internship request has been approved by the Coordinator.</p>`,
        });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError.message);
        // Continue even if email fails
      }
    } else {
      console.warn("No student email found. Skipping email notification.");
    }

    res.json({ message: "Request approved successfully." });
  } catch (err) {
    console.error("Approval failed:", err);
    res.status(500).json({ message: "Approval failed." });
  }
};

const coordinatorRejectRequest = async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ message: "Rejection reason required." });
  }

  try {
    const request = await InternshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.status = "rejected";
    request.coordinator_status = "Rejected";
    request.coordinator_comment = reason;
    await request.save();

    if (request.student?.email) {
      try {
        await EmailService.sendEmail({
          to: request.student.email,
          subject: "Internship Request Rejected",
          html: `<p>Your internship request has been rejected.<br><b>Reason:</b> ${reason}</p>`,
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError.message);
      }
    } else {
      console.warn("No student email found. Skipping email notification.");
    }

    res.json({ message: "Request rejected successfully." });
  } catch (err) {
    console.error("Rejection failed:", err);
    res.status(500).json({ message: "Rejection failed." });
  }
};


const getManualReviewForms = async (req, res) => {
  try {
    const forms = await InternshipRequest.find({
      csValidationPassed: false,
      manualReviewStatus: "pending",
    }).populate("student", "userName email");

    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching manual review forms:", error);
    res.status(500).send("Server Error");
  }
};

const coordinatorApproveManualReview = async (req, res) => {
  try {
    const formId = req.params.id;
    const request = await InternshipRequest.findByIdAndUpdate(
      formId,
      { coordinator_status: "approved", manualReviewStatus: "approved" },
      { new: true }
    ).populate("student");

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.student?.email) {
      await EmailService.sendEmail({
        to: request.student.email,
        subject: "Internship Request Approved (Manual Review)",
        html: `<p>Your internship request has been manually reviewed and approved by the Coordinator.</p>`,
      });
    }

    res.json({ message: "Manual Review Request Approved Successfully" });
  } catch (err) {
    console.error("Manual review approval failed:", err);
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

const coordinatorRejectManualReview = async (req, res) => {
  const { reason } = req.body;
  if (!reason)
    return res.status(400).json({ message: "Rejection reason required." });

  try {
    const formId = req.params.id;
    const request = await InternshipRequest.findByIdAndUpdate(
      formId,
      { coordinator_status: "rejected", manualReviewStatus: "rejected" },
      { new: true }
    ).populate("student");

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.student?.email) {
      await EmailService.sendEmail({
        to: request.student.email,
        subject: "Internship Request Rejected (Manual Review)",
        html: `<p>Your internship request has been manually reviewed and rejected.<br><b>Reason:</b> ${reason}</p>`,
      });
    }

    res.json({ message: "Manual Review Request Rejected Successfully" });
  } catch (err) {
    console.error("Manual review rejection failed:", err);
    res.status(500).json({ message: "Rejection failed.", error: err.message });
  }
};

// =======================================
//         Coordinator Resend Feature
// =======================================

const coordinatorResendRequest = async (req, res) => {
  try {
    const submission = await InternshipRequest.findById(req.params.id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    submission.coordinator_reminder_count = 0;
    submission.last_coordinator_reminder_at = new Date();
    submission.coordinator_status = "pending";
    await submission.save();

    res.status(200).json({ message: "Reminder cycle restarted." });
  } catch (error) {
    console.error("Error in coordinatorResendRequest:", error);
    res.status(500).json({ message: "Server error while resending request." });
  }
};

// =======================================
//         Coordinator Evaluation
// =======================================

const getCoordinatorReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({}).sort({ submittedAt: -1 });
    res.status(200).json({ reports });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch weekly reports." });
  }
};

const getCoordinatorEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({
      advisorAgreement: true,
      coordinatorAgreement: { $ne: true },
    });
    res.status(200).json(evaluations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch evaluations." });
  }
};

const approveJobEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await Evaluation.findById(id);
    if (!evaluation)
      return res.status(404).json({ message: "Evaluation not found." });

    evaluation.coordinatorAgreement = true;
    evaluation.updatedAt = new Date();
    await evaluation.save();

    await EmailService.sendEmail({
      to: evaluation.interneeEmail,
      subject: "Your Job Evaluation (Form A3) is Approved!",
      html: `<p>Dear ${evaluation.interneeName}, your evaluation is approved! Kindly upload this to Canvas.</p>`,
    });

    res.json({ message: "A3 Job Evaluation approved and emailed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Approval failed." });
  }
};

const rejectJobEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const evaluation = await Evaluation.findById(id);
    if (!evaluation)
      return res.status(404).json({ message: "Evaluation not found." });

    evaluation.coordinatorAgreement = false;
    evaluation.updatedAt = new Date();
    await evaluation.save();

    await EmailService.sendEmail({
      to: evaluation.interneeEmail,
      subject: "Your Job Evaluation (Form A3) Needs Attention",
      html: `<p>Dear ${evaluation.interneeName}, your A3 evaluation was not approved.<br><b>Reason:</b> ${reason}</p>`,
    });

    res.json({ message: "A3 Job Evaluation rejected successfully." });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed." });
  }
};

// =======================================
//              EXPORTS
// =======================================

module.exports = {
  // Student-Side
  getStudentSubmissions,
  deleteStudentSubmission,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteStalledSubmission,

  // Coordinator-Side
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  coordinatorResendRequest,
  getManualReviewForms,
  coordinatorApproveManualReview,
  coordinatorRejectManualReview,

  // Coordinator Reports and Evaluations
  getCoordinatorReports,
  getCoordinatorEvaluations,
  approveJobEvaluation,
  rejectJobEvaluation,
};
