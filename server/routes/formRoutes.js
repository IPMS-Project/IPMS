const express = require('express');
const router = express.Router();
const { insertFormData } = require('../services/insertData');
const InternshipRequest = require('../models/InternshipRequest');
const emailService = require("../services/emailService");


let status = '';

function validateFormData(formData) {
  const requiredFields = [
    'workplaceName', 'website', 'phone',
    'advisorName', 'advisorJobTitle', 'advisorEmail',
    'creditHours', 'startDate', 'endDate', 'tasks'
  ];

  for (const field of requiredFields) {
    if (!formData[field] || formData[field] === '') {
      return `Missing or empty required field: ${field}`;
    }
  }

  if (!Array.isArray(formData.tasks) || formData.tasks.length < 3)
    return 'At least 3 tasks must be provided';

  const uniqueOutcomes = new Set();
  formData.tasks.forEach(task => {
    if (Array.isArray(task.outcomes)) {
      task.outcomes.forEach(o => uniqueOutcomes.add(o));
    }
  });

  formData.status = uniqueOutcomes.size < 3 ? 'pending manual review' : 'submitted';
  return null;
}

router.post("/submit", async (req, res) => {
  try {
    const form = new InternshipRequest(req.body);
    await form.save();
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Validation Errors:", error.errors);
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});


// Get All A.1 Forms (Dashboard Table)
// GET all A.1 forms (for dashboard)
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




// Get One Form by Sooner ID (Modal)
router.get('/a1forms/:soonerId', async (req, res) => {
  try {
    const form = await InternshipRequest.findOne({
      $or: [
        { supervisor_comment: { $exists: false } },
        { supervisor_comment: "" }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(forms);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Error fetching form' });
  }
});


// Supervisor Approve/Reject Route
router.post("/supervisor-action", async (req, res) => {
  const { soonerId, comment, signature, status } = req.body;

  if (!soonerId || !comment || !signature || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updated = await InternshipRequest.findOneAndUpdate(
      { soonerId },
      {
        supervisor_comment: comment,
        supervisor_status: status
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Entry not found for provided soonerId" });
    }

    res.json({ message: "Supervisor action updated", updated });
  } catch (err) {
    console.error("Error updating supervisor action:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


module.exports = router;
