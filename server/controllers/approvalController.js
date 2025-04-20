const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const EmailService = require("../services/emailService");

// =========================================== //
//           Managing Supervisor Forms         //
// =========================================== //

exports.getSupervisorForms = async (req, res, filter) => {
    try {
        // ----------------------------
        //      Fetching A1 Form
        // ----------------------------
        const requests = await InternshipRequest.find(filter)
                                                .populate("student_id", "userName email");

        const typedRequests = requests.map(req => ({
            ...req.toObject(), // convert Mongoose doc to plain JS object
            form_type: "A1"    // add the custom type
        }));

        // ----------------------------
        //      Fetching A2 Form
        // ----------------------------
        const reports = await WeeklyReport.find(filter)
                                          .populate("student_id", "userName email");

        // Adding custom type to A2 Form
        const typedReports = reports.map(report => ({
            ...report.toObject(), // convert Mongoose doc to plain JS object
            form_type: "A2"       // add the custom type
        }));

        // ----------------------------
        //      Fetching A3 Form
        // ----------------------------
        const evaluations = await Evaluation.find(filter)
                                            .populate("student_id", "userName email");

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

    const emailSubject = `Form ${action === "approve" ? "Approved" : "Rejected"}`;
    let emailBody = `<p>Your ${form_type} form has been ${action}ed by the supervisor.</p>`;
    if (comment) {
      emailBody += `<p>Comment: ${comment}</p>`;
    }

    await EmailService.sendEmail({
      to: form.student_id.email,
      subject: emailSubject,
      html: emailBody,
    });

    res.status(200).json({
      message: `Form ${action}ed successfully`,
      updatedForm: form,
    });
  } catch (err) {
    console.error("SupervisorFormAction error:", err);
    res.status(500).json({ message: "Error processing form", error: err.message });
  }
};


// =========================================== //
//           Coordinator Dashboard             //
// =========================================== //

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

// Coordinator View Single Request
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

// Coordinator Approve Request
exports.coordinatorApproveRequest = async (req, res) => {
  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

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

// Coordinator Reject Request
exports.coordinatorRejectRequest = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Reason required" });

  try {
    const request = await InternshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

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
