const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const { insertFormData } = require("../services/insertData");
const emailService = require("../services/emailService"); // Missing import added



router.get("/internshiprequests", async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      supervisor_status: "pending",
      
      supervisor_status: { $in: [null, "pending"] } // not yet reviewed by supervisor
    }).sort({ createdAt: 1 })  .populate("student", "userName")  // oldest first


    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching internship requests:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching internship requests" });
  }
});

// -----------------------------------------
// Validate Form Data (Before Submit)
// -----------------------------------------
function validateFormData(formData) {
  const requiredFields = [

    'workplaceName',
    'phone',
    'advisorName',
    'advisorEmail',
    'creditHours',
    'startDate',
    'endDate',
    'tasks'

  ];

  for (const field of requiredFields) {
    if (!formData[field] || formData[field] === "") {
      return `Missing or empty required field: ${field}`;
    }
  }


  if (!Array.isArray(formData.tasks) || formData.tasks.length === 0) {
    return "Tasks must be a non-empty array.";
  }

  const tasks = formData.tasks;
  if (
    tasks.filter((task) => task.description && task.description.trim() !== "")
      .length < 3
  )
    return "At least 3 tasks must be provided.";

  const uniqueOutcomes = new Set();
  tasks.forEach((task) => {
    if (Array.isArray(task.outcomes)) {
      task.outcomes.forEach((outcome) => uniqueOutcomes.add(outcome));
    }
  });

  formData.status =
    uniqueOutcomes.size < 3 ? "pending manual review" : "submitted";
  return null;
}

// -----------------------------------------
// Submit Form A1
// -----------------------------------------
router.post("/submit", async (req, res) => {
  const formData = req.body;
  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await insertFormData(formData);
    res.status(200).json({
      message: "Form received and handled!",
      manual: formData.status !== "submitted",
    });
  } catch (error) {
    console.error("Error handling form data:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// -----------------------------------------
// Get pending internship requests for Student Dashboard
// -----------------------------------------
router.get("/pending-requests", async (req, res) => {
  try {
    const pending = await InternshipRequest.find({
      status: { $in: ["submitted", "pending manual review"] },
    });
    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending submissions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------
// Resend Request (Reset reminders)
// -----------------------------------------
router.post("/requests/:id/resend", async (req, res) => {
  try {
    const request = await InternshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.reminders = [new Date()];
    request.coordinatorResponded = false;
    request.studentNotified = false;
    await request.save();

    // Send email to internship advisor and student
    await emailService.sendEmail({
      to: [request.internshipAdvisor.email, request.student.email],
      subject: "Internship Request Resent",
      html: `
        <p>Hello,</p>
        <p>The student <strong>${request.student.name}</strong> has resent their internship approval request due to coordinator inactivity.</p>
        <p>Please review and take necessary action.</p>
      `,
    });

    res.json({ message: "Request resent successfully" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Failed to resend request" });
  }
});

// -----------------------------------------
// Delete Request
// -----------------------------------------
router.delete("/requests/:id", async (req, res) => {
  try {
    const deleted = await InternshipRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete request" });
  }
});

// -----------------------------------------
// Fetch student's approval status
// -----------------------------------------
router.post("/student", async (req, res) => {
  const { ouEmail } = req.body;
  if (!ouEmail) return res.status(400).json({ message: "Missing email" });

  try {
    const request = await InternshipRequest.findOne({
      "student.email": ouEmail,
    });
    if (!request) return res.json({ approvalStatus: "not_submitted" });

    return res.json({ approvalStatus: request.status || "draft" });
  } catch (err) {
    console.error("Student route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
