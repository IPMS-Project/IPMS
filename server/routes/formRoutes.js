const express = require('express');
const router = express.Router();
const { insertFormData } = require('../services/insertData');
const WeeklyReport = require('../models/WeeklyReport');
const EmailService = require('../services/EmailService'); //

let status = '';

// --- A2 Form Submission ---
router.post('/submit', async (req, res) => {
  const formData = req.body;
  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    formData.form_type = "A2";
    await insertFormData(formData);
    res.status(200).json({ message: 'Form received and handled!', status, manual: formData.status !== 'submitted' });
  } catch (error) {
    console.error('Error handling form data:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// --- Get Pending A2 Forms for Supervisor ---
router.get('/supervisor/a2forms', async (req, res) => {
  try {
    const reports = await WeeklyReport.find({
      supervisor_status: "pending",
    }).sort({ submittedAt: 1 });

    res.status(200).json(reports);
  } catch (err) {
    console.error('Error fetching A2 forms:', err);
    res.status(500).json({ message: 'Failed to retrieve weekly reports' });
  }
});

// --- Approve A2 Form ---
router.patch('/approve/:id', async (req, res) => {
  console.log("✅ Approve route hit. ID:", req.params.id);
  try {
    const updated = await WeeklyReport.findByIdAndUpdate(
      req.params.id,
      {
        supervisor_status: "approved",
        coordinator_status: "pending"
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({ message: "Form approved", form: updated });
  } catch (error) {
    console.error("Error approving form:", error);
    res.status(500).json({ message: "Failed to approve form" });
  }
});

// --- Reject A2 Form + Send Email Notification ---
router.patch('/reject/:id', async (req, res) => {
  const { comment } = req.body;

  try {
    const updated = await WeeklyReport.findByIdAndUpdate(
      req.params.id,
      {
        supervisor_status: "rejected",
        supervisorComments: comment || "No comment provided"
      },
      { new: true }
    ).populate("student_id", "userName email"); // ✅ populate student info

    if (!updated) {
      return res.status(404).json({ message: "Form not found" });
    }

    // ✅ Send email to student
    if (updated.student_id && updated.student_id.email) {
      await EmailService.sendEmail({
        to: updated.student_id.email,
        subject: "Your A2 Weekly Report has been Rejected",
        html: `
          <p>Hello ${updated.student_id.userName},</p>
          <p>Your A2 Weekly Report (Week ${updated.week}) has been <strong>rejected</strong> by the supervisor.</p>
          <p><strong>Comment:</strong> ${comment || "No additional comment provided."}</p>
        `
      });
    }

    res.status(200).json({ message: "Form rejected and student notified", form: updated });
  } catch (error) {
    console.error("Error rejecting form:", error);
    res.status(500).json({ message: "Failed to reject form" });
  }
});

module.exports = router;
