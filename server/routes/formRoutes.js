const express = require("express");
const router = express.Router();
const InternshipRequest = require('../models/InternshipRequest');
const Evaluation = require('../models/Evaluation');
const emailService = require("../services/emailService");

// ==========================
// A1: InternshipRequest Form
// ==========================

// Submit A1 form
router.post("/submit", async (req, res) => {
  try {
    const form = new InternshipRequest({
      ...req.body,
      supervisor_status: "pending" // ✅ Required for dashboard visibility
    });

    await form.save();
    res.status(201).json({ message: "A1 form submitted successfully!" });
  } catch (error) {
    console.error("A1 Validation Errors:", error.errors);
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// Get all A1 forms for supervisor (if still used anywhere)
router.get('/a1forms', async (req, res) => {
  try {
    const forms = await InternshipRequest.find({
      $or: [
        { supervisor_comment: { $exists: false } },
        { supervisor_comment: "" }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(forms);
  } catch (error) {
    console.error('Error fetching A.1 forms:', error);
    res.status(500).json({ message: 'Failed to fetch forms' });
  }
});

// Get a specific A1 form by Sooner ID
router.get('/a1forms/:soonerId', async (req, res) => {
  try {
    const form = await InternshipRequest.findOne({
      soonerId: req.params.soonerId,
      $or: [
        { supervisor_comment: { $exists: false } },
        { supervisor_comment: "" }
      ]
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Error fetching form' });
  }
});

// ===================
// A3: Evaluation Form
// ===================

// Submit A3 form
router.post("/submit-a3", async (req, res) => {
  try {
    const form = new Evaluation({
      ...req.body,
      supervisor_status: "pending" // ✅ Required for dashboard visibility
    });

    await form.save();
    res.status(201).json({ message: "A3 form submitted successfully!" });
  } catch (err) {
    console.error("A3 submission error:", err);
    res.status(500).json({ message: "Failed to submit A3 form" });
  }
});

module.exports = router;
