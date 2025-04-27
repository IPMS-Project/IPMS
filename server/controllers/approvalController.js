const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const EmailService = require("../services/emailService");
const UserTokenRequest = require("../models/TokenRequest");

// =========================================== //
//           Managing Supervisor Forms         //
// =========================================== //

exports.getSupervisorForms = async (req, res, filter) => {
  try {
    const requests = await InternshipRequest.find(filter)
      .populate("_id", "fullName ouEmail soonerId");

    const typedRequests = requests.map(req => ({
      ...req.toObject(),
      form_type: "A1"
    }));

    const reports = await WeeklyReport.find(filter)
      .populate("student_id", "fullName ouEmail soonerId");

    const typedReports = reports.map(report => ({
      ...report.toObject(),
      form_type: "A2"
    }));

    const evaluations = await Evaluation.find(filter)
      .populate("student_id", "fullName ouEmail soonerId");

    const typedEvaluations = evaluations.map(evaluation => ({
      ...evaluation.toObject(),
      form_type: "A3"
    }));

    const allRequests = [...typedRequests, ...typedReports, ...typedEvaluations];
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(allRequests);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch internship requests",
      error: err.message,
    });
  }
};

exports.handleSupervisorFormAction = async (req, res, action) => {
  try {
    const form_type = req.params.type;
    const formId = req.params.id;
    const { comment = "" } = req.body;

    const models = {
      A1: require("../models/InternshipRequest"),
      A2: require("../models/WeeklyReport"),
      A3: require("../models/Evaluation"),
    };

    const FormModel = models[form_type];
    if (!FormModel) {
      return res.status(400).json({ message: "Invalid form type" });
    }

    const update = {
      supervisor_status: action === "approve" ? "approved" : "rejected",
      supervisor_comment: comment,
    };

    const form = await FormModel.findByIdAndUpdate(formId, update, { new: true }).populate("student_id", "userName email");

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const studentEmail =
      form.student_id?.email ||
      form.interneeEmail ||
      form.studentEmail ||
      null;

    const emailSubject = `Form ${action === "approve" ? "Approved" : "Rejected"}`;
    let emailBody = `<p>Your ${form_type} form has been ${action}ed by the supervisor.</p>`;
    if (comment) {
      emailBody += `<p>Comment: ${comment}</p>`;
    }

    if (studentEmail) {
      await EmailService.sendEmail({
        to: studentEmail,
        subject: emailSubject,
        html: emailBody,
      });
    }

    res.status(200).json({
      message: `Form ${action}ed successfully`,
      updatedForm: form,
    });
  } catch (err) {
    res.status(500).json({ message: "Error processing form", error: err.message });
  }
};

// =========================================== //
//           Coordinator Dashboard             //
// =========================================== //

exports.getCoordinatorRequests = async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      coordinator_status: "pending",
    }).populate("student", "userName email");
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

exports.getCoordinatorRequestDetails = async (req, res) => {
  try {
    const requestData = await InternshipRequest.findById(req.params.id).lean();
    if (!requestData) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ requestData, supervisorStatus: "Not Submitted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
};

exports.coordinatorApproveRequest = async (req, res) => {
  try {
    const request = await InternshipRequest.findById(req.params.id).populate("student");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.coordinator_status = "approved";
    await request.save();

    if (request.student?.ouEmail) {
      await EmailService.sendEmail({
        to: request.student.ouEmail,
        subject: "Internship Request Approved",
        html: `<p>Your internship request has been approved by the Coordinator.</p>`,
      });
    }

    res.json({ message: "Request Approved Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

exports.coordinatorRejectRequest = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Reason required" });

  try {
    const request = await InternshipRequest.findById(req.params.id).populate("student");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.coordinator_status = "rejected";
    await request.save();

    if (request.student?.ouEmail) {
      await EmailService.sendEmail({
        to: request.student.ouEmail,
        subject: "Internship Request Rejected",
        html: `<p>Your internship request has been rejected.<br>Reason: ${reason}</p>`,
      });
    }

    res.json({ message: "Request Rejected Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};

// =========================================== //
//      Coordinator Manual Review of A.1 Forms //
// =========================================== //

exports.coordinatorApproveManualReview = async (req, res) => {
  try {
    const formId = req.params.id;
    const request = await InternshipRequest.findById(formId).populate('student');

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.coordinator_status = "approved";
    request.manualReviewStatus = "approved";
    await request.save();

    if (request.student?.ouEmail) {
      await EmailService.sendEmail({
        to: request.student.ouEmail,
        subject: "Internship Request Approved (Manual Review)",
        html: `<p>Your internship request has been manually reviewed and approved by the Coordinator. Please submit your A.1 form on Canvas.</p>`,
      });
    }

    if (request.student?.academicAdvisor) {
      await EmailService.sendEmail({
        to: request.student.academicAdvisor,
        subject: "Advisee Internship Approval Notification",
        html: `<p>Your advisee <b>${request.student.fullName || "Student"}</b> has had their internship request manually approved by the Coordinator. Please proceed with any necessary academic registration.</p>`,
      });
    }

    res.json({ message: "Manual Review Request Approved Successfully" });
  } catch (err) {
    console.error("Error during manual review approval:", err);
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

exports.coordinatorRejectManualReview = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Reason required" });

  try {
    const formId = req.params.id;
    const request = await InternshipRequest.findById(formId).populate('student');

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.coordinator_status = "rejected";
    request.manualReviewStatus = "rejected";
    await request.save();

    if (request.student?.ouEmail) {
      await EmailService.sendEmail({
        to: request.student.ouEmail,
        subject: "Internship Request Rejected (Manual Review)",
        html: `<p>Your internship request has been manually reviewed and rejected.<br><b>Reason:</b> ${reason}</p>`,
      });
    }

    res.json({ message: "Manual Review Request Rejected Successfully" });
  } catch (err) {
    console.error("Error during manual review rejection:", err);
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};
