const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const EmailService = require("../services/emailService");
const UserTokenRequest = require("../models/TokenRequest");

// ---------------------------------------------------
// Student + Supervisor methods (NO CHANGES)
// ---------------------------------------------------

const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await InternshipRequest.find({
      student: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

const deleteStudentSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await InternshipRequest.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found." });

    if (submission.student.toString() !== req.user._id.toString()) {
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
    res.status(500).json({ message: "Internal server error." });
  }
};

const getPendingSubmissions = async (req, res) => {
  try {
    const pendingRequests = await InternshipRequest.find({
      supervisor_status: "pending",
    }).populate("student", "fullName email");
    res.status(200).json(pendingRequests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending submissions." });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const request = await InternshipRequest.findByIdAndUpdate(
      id,
      { supervisor_status: "approved", supervisor_comment: comment || "" },
      { new: true }
    );
    if (!request)
      return res.status(404).json({ message: "Submission not found." });

    res.json({ message: "Submission approved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Approval failed." });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const request = await InternshipRequest.findByIdAndUpdate(
      id,
      { supervisor_status: "rejected", supervisor_comment: comment || "" },
      { new: true }
    );
    if (!request)
      return res.status(404).json({ message: "Submission not found." });

    res.json({ message: "Submission rejected successfully." });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed." });
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
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// ---------------------------------------------------
// Coordinator-specific methods (UPDATED)
// ---------------------------------------------------

const getCoordinatorRequests = async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      coordinator_status: "pending",
    }).populate("student", "fullName email");
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch internship requests." });
  }
};

const getCoordinatorRequestDetails = async (req, res) => {
  try {
    const requestData = await InternshipRequest.findById(req.params.id)
      .populate("student", "fullName ouEmail")
      .lean();
    if (!requestData)
      return res.status(404).json({ message: "Request not found." });

    const supervisorStatus = requestData.supervisor_status || "Not Submitted";
    res.status(200).json({ requestData, supervisorStatus });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch request details." });
  }
};

const coordinatorApproveRequest = async (req, res) => {
  try {
    const request = await InternshipRequest.findById(req.params.id).populate(
      "student",
      "fullName email"
    );
    if (!request)
      return res.status(404).json({ message: "Request not found." });

    request.status = "approved";
    request.coordinator_status = "Approved";
    request.coordinator_comment = "Approved by Coordinator";
    await request.save();

    await EmailService.sendEmail({
      to: request.student.email,
      subject: "Internship Request Approved",
      html: `<p>Your internship request has been approved by the Coordinator.</p>`,
    });

    res.json({ message: "Request approved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Approval failed." });
  }
};

const coordinatorRejectRequest = async (req, res) => {
  const { reason } = req.body;
  if (!reason)
    return res.status(400).json({ message: "Rejection reason required." });

  try {
    const request = await InternshipRequest.findById(req.params.id).populate(
      "student",
      "fullName email"
    );
    if (!request)
      return res.status(404).json({ message: "Request not found." });

    request.status = "rejected";
    request.coordinator_status = "Rejected";
    request.coordinator_comment = reason;
    await request.save();

    await EmailService.sendEmail({
      to: request.student.email,
      subject: "Internship Request Rejected",
      html: `<p>Your internship request has been rejected.<br><b>Reason:</b> ${reason}</p>`,
    });

    res.json({ message: "Request rejected successfully." });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed." });
  }
};

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
    const evaluations = await Evaluation.find({ advisorAgreement: true });
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
      subject: "Job Evaluation Approved",
      html: `<p>Your Job Evaluation (Form A3) has been approved by the Coordinator.</p>`,
    });

    res.json({ message: "Job Evaluation approved successfully." });
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
      subject: "Job Evaluation Rejected",
      html: `<p>Your Job Evaluation (Form A3) was rejected.<br><b>Reason:</b> ${reason}</p>`,
    });

    res.json({ message: "Job Evaluation rejected successfully." });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed." });
  }
};

module.exports = {
  getStudentSubmissions,
  deleteStudentSubmission,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteStalledSubmission,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  getCoordinatorReports,
  getCoordinatorEvaluations,
  approveJobEvaluation,
  rejectJobEvaluation,
};
