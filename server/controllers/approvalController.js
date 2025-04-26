const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const EmailService = require("../services/emailService");
const UserTokenRequest = require("../models/TokenRequest");
const { supervisorReminder } = require("../jobs/reminderEmail");

// =========================================== //
//           Managing Supervisor Forms         //
// =========================================== //

const findSupervisorFromForm = async (form) => {
    let supervisor = null;
    try {
        if (form.form_type === "A1") {
            supervisor = await UserTokenRequest.findOne({ ouEmail: form.internshipAdvisor.email });
        }
        else if (form.form_type === "A2") {
            supervisor = await UserTokenRequest.findOne({ ouEmail: form.supervisorEmail });
        }
        else if (form.form_type === "A3") {
            const internship_a1 = await InternshipRequest.findById(form.internshipId);
            supervisor = await UserTokenRequest.findOne({ ouEmail: internship_a1.internshipAdvisor.email });
        }
        else {
            logger.error(`Unknown form type: ${form.form_type}`);
        }
    }
    catch (err) {
        logger.error(`Error retrieving supervisor: ${err.message}`);
    }
    return supervisor;
}

const getSupervisorForms = async (req, res) => {
  const temp_supervisor = await UserTokenRequest.findOne({ ouEmail: "alice.student-1@ou.edu" });
  // const supervisor = req.user;
  const supervisor = temp_supervisor;
  console.log("Supervisor:", supervisor);

  const InternshipRequest = require("../models/InternshipRequest");
  const WeeklyReport = require("../models/WeeklyReport");
  const Evaluation = require("../models/Evaluation");

  try {
    // ----------------------------
    //      Fetching A1 Forms
    // ----------------------------
    const filterA1 = {
      "internshipAdvisor.email": supervisor.ouEmail,
      supervisor_status: { $in: ["pending"] },
    };

    const a1Forms = await InternshipRequest.find(filterA1)
                                           .populate("student", "fullName ouEmail");

    const typedA1 = a1Forms.map((form) => ({
      ...form.toObject(),
      form_type: "A1",
    }));

    // ----------------------------
    //      Fetching A2 Forms
    // ----------------------------
    const filterA2 = {
      supervisorEmail: supervisor.ouEmail,
      supervisor_status: { $in: ["pending"] },
    };

    const a2Forms = await WeeklyReport.find(filterA2)
                                      .populate("studentId", "fullName ouEmail");

    const typedA2 = a2Forms.map((form) => ({
      ...form.toObject(),
      form_type: "A2",
    }));

    // ----------------------------
    //      Fetching A3 Forms
    // ----------------------------
      const studentIdsWithA2 = a2Forms.map((form) => form.studentId);
      const a1FormsId = a1Forms.map((form) => form._id);

    const filterA3 = {
        interneeId: { $in: studentIdsWithA2 },
        internshipId: { $in: a1FormsId },
        supervisor_status: { $in: ["pending"] },
    };

      const a3Forms = await Evaluation.find(filterA3)
                                      .populate("interneeId", "fullName ouEmail");

    const typedA3 = a3Forms.map((form) => ({
      ...form.toObject(),
      form_type: "A3",
    }));

    // ----------------------------
    //      Combine All Forms
    // ----------------------------
    const allForms = [...typedA1, ...typedA2, ...typedA3];

    // Sort by createdAt
    allForms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Respond
    return res.status(200).json(allForms);

  } catch (err) {
    console.error("Error in getSupervisorForms:", err.message);
    return res.status(500).json({
      message: "Failed to fetch supervisor forms",
      error: err.message,
    });
  }
};


const handleSupervisorFormAction = async (req, res, action) => {
    try {
    const form_type = req.params.type;
    const formId = req.params.id;
      const { comment = "", signature = "" } = req.body;

      const models = {
          A1: require("../models/InternshipRequest"),
          A2: require("../models/WeeklyReport"),
          A3: require("../models/Evaluation"),
      };

    const FormModel = models[form_type];
    if (!FormModel) {
      return res.status(400).json({ message: "Invalid form type" });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const update = {
      supervisor_status: action === "approve" ? "approved" : "rejected",
      supervisor_comment: comment,
      supervisor_signature: signature,
    };

    const form = await FormModel.findByIdAndUpdate(formId, update, { new: true })

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const studentEmail = form.student_id?.email || form.interneeEmail || form.studentEmail || null;
    let emailSubject = `Form ${action === "approve" ? "Approved" : "Rejected"}`;
    let emailBody = `<p>Your ${form_type} form has been ${action}ed by the supervisor.</p>`;
    if (comment) {
      emailBody += `<p>Comment: ${comment}</p>`;
    }

    const student_id = form.internee_id || form.student || form.interneeId;
    const student = await UserTokenRequest.findById(student_id);
    const student_mail = student?.ouEmail;

    try {
      await EmailService.sendEmail({
        to: student_mail,
        subject: emailSubject,
        html: emailBody,
      });
    } catch (err) {
      console.error("Email sending error:", err);
    }

    console.log("Email sent to:", student_mail);
    res.status(200).json({ message: `Form ${action}ed successfully`, updatedForm: form });
  } catch (err) {
    console.error("SupervisorFormAction error:", err);
    res.status(500).json({ message: "Error processing form", error: err.message });
  }
};

const getCoordinatorRequests = async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      coordinator_status: "pending",
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

    const supervisorStatus = requestData.supervisor_status || "Not Submitted";

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

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.coordinator_status = "Approved";
    request.coordinator_comment = "Approved by Coordinator";
    await request.save();

    await EmailService.sendEmail({
      to: request.student.email,
      subject: "Internship Request Approved",
      html: `<p>Your internship request has been approved by the Coordinator.</p>`,
    });

    res.json({ message: "Request Approved Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
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

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.coordinator_status = "Rejected";
    request.coordinator_comment = reason;
    await request.save();

    await EmailService.sendEmail({
      to: request.student.email,
      subject: "Internship Request Rejected",
      html: `<p>Your internship request has been rejected.<br>Reason: ${reason}</p>`,
    });

    res.json({ message: "Request Rejected Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};

const coordinatorResendRequest = async (req, res) => {
  try {
    const submission = await InternshipRequest.findById(req.params.id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    submission.coordinator_reminder_count = 0;
    submission.last_coordinator_reminder_at = new Date();
    submission.coordinator_status = "pending";
    await submission.save();

    return res.status(200).json({ message: "Reminder cycle restarted." });
  } catch (error) {
    console.error("Error in coordinatorResendRequest:", error);
    return res.status(500).json({ message: "Server error while resending request." });
  }
};

const deleteStudentSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const submission = await InternshipRequest.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Submission not found." });

    if (submission.student.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this submission." });
    }

    if (submission.coordinator_status !== "pending") {
      return res.status(400).json({ message: "Submission already reviewed. Cannot delete." });
    }

    await InternshipRequest.findByIdAndDelete(id);
    return res.status(200).json({ message: "Submission successfully deleted by student." });
  } catch (err) {
    console.error("Error deleting student submission:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getStudentSubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const submissions = await InternshipRequest.find({ student: studentId }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

const deleteStalledSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await InternshipRequest.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    if (submission.coordinator_status !== "pending") {
      return res.status(400).json({ message: "Submission already reviewed. Cannot delete." });
    }

    await InternshipRequest.findByIdAndDelete(id);

    return res.status(200).json({ message: "Submission deleted successfully." });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  coordinatorResendRequest,
  deleteStudentSubmission,
  getStudentSubmissions,
  getSupervisorForms,
  handleSupervisorFormAction,
  deleteStalledSubmission,
};
