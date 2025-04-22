const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const EmailService = require("../services/emailService");


// 🔹 Supervisor Routes
const getPendingSubmissions = async (req, res) => {

const UserTokenRequest = require("../models/TokenRequest");

// =========================================== //
//           Managing Supervisor Forms         //
// =========================================== //

exports.getSupervisorForms = async (req, res, filter) => {
    try {
        // ----------------------------
        //      Fetching A1 Form
        // ----------------------------
        const requests = await InternshipRequest.find(filter)
                                                .populate("_id", "fullName ouEmail soonerId");

        const typedRequests = requests.map(req => ({
            ...req.toObject(), // convert Mongoose doc to plain JS object
            form_type: "A1"    // add the custom type
        }));

        // ----------------------------
        //      Fetching A2 Form
        // ----------------------------
        const reports = await WeeklyReport.find(filter)
                                          .populate("student_id", "fullName ouEmail soonerId");

        // Adding custom type to A2 Form
        const typedReports = reports.map(report => ({
            ...report.toObject(), // convert Mongoose doc to plain JS object
            form_type: "A2"       // add the custom type
        }));

        // ----------------------------
        //      Fetching A3 Form
        // ----------------------------
        const evaluations = await Evaluation.find(filter)
                                            .populate("student_id", "fullName ouEmail soonerId");

        // Adding custom type to A3 Form
        const typedEvaluations = evaluations.map(evaluation => ({
            ...evaluation.toObject(), // convert Mongoose doc to plain JS object
            form_type: "A3"     // add the custom type
        }));
        
        // ----------------------------
        //      Combine forms
        // ----------------------------
        const allRequests = [...typedRequests, ...typedReports, ...typedEvaluations];

        // Sort by createdAt date
        allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Send response
        res.status(200).json(allRequests);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch internship requests",
            error: err.message,
        });
    }
}

exports.handleSupervisorFormAction = async (req, res, action) => {

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

    if (!studentEmail) {
      console.warn("⚠️ No student email found for form:", form._id);
    } else {
      const emailSubject = `Form ${action === "approve" ? "Approved" : "Rejected"}`;
      let emailBody = `<p>Your ${form_type} form has been ${action}ed by the supervisor.</p>`;
      if (comment) {
        emailBody += `<p>Comment: ${comment}</p>`;
      }
    }

    const student_id = form.student_id || form.internee_id || form.student;
    const student = await UserTokenRequest.findById(student_id);
    const student_mail = student?.ouEmail || form?.interneeEmail;

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

    res.status(200).json({
      message: `Form ${action}ed successfully`,
      updatedForm: form,
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
    console.error("SupervisorFormAction error:", err);
    res.status(500).json({ message: "Error processing form", error: err.message });
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
=======
// =========================================== //
//           Coordinator Dashboard             //
// =========================================== //


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

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

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
    res.status(500).json({ message: "Rejection failed", error: err.message });
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
