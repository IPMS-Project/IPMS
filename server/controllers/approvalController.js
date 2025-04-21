const Submission = require("../models/Submission");
const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport"); // ✅ added for A2
const EmailService = require("../services/emailService");

// Get Supervisor Pending Submissions
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

// Supervisor Approve Submission
exports.approveSubmission = async (req, res) => {
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

// Supervisor Reject Submission
exports.rejectSubmission = async (req, res) => {
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

// ✅ Supervisor Reject Weekly Report (A2)
exports.rejectWeeklyReport = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const report = await WeeklyReport.findByIdAndUpdate(
      id,
      {
        supervisor_status: "rejected",
        supervisorComments: comment || "No comment provided",
      },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Weekly Report not found" });

    if (report.email) {
      await EmailService.sendEmail({
        to: report.email,
        subject: "Weekly Report Rejected",
        html: `
          <p>Hello,</p>
          <p>Your A2 Weekly Report for <strong>${report.week}</strong> has been <strong>rejected</strong> by the supervisor.</p>
          <p><strong>Comment:</strong> ${comment || "No additional comment provided."}</p>
        `,
      });
    }

    res.status(200).json({ message: "Weekly Report rejected and student notified", form: report });
  } catch (err) {
    console.error("Error rejecting Weekly Report:", err);
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};

// Coordinator Dashboard: Get All Internship Requests
exports.getCoordinatorRequests = async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      status: "submitted",
    }).populate("student", "userName email");
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

exports.getCoordinatorRequestDetails = async (req, res) => {
  try {
    const requestData = await InternshipRequest.findById(req.params.id).lean();

    if (!requestData)
      return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ requestData, supervisorStatus: "Not Submitted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
};

exports.coordinatorApproveRequest = async (req, res) => {
  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

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

exports.coordinatorRejectRequest = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Reason required" });

  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

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