// server/routes/formRoutes.js
const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const { insertFormData } = require("../services/insertData");

// Utility: Validate required fields (unchanged)
function validateFormData(formData) {
  const requiredFields = [
    "workplaceName",
    "website",
    "phone",
    "advisorName",
    "advisorJobTitle",
    "advisorEmail",
    "creditHour",
    "startDate",
    "endDate",
    "tasks"
  ];

  for (const field of requiredFields) {
    if (!formData[field] || formData[field] === "") {
      return `Missing or empty required field: ${field}`;
    }
  }

  if (!Array.isArray(formData.tasks) || formData.tasks.length === 0) {
    return "Tasks must be a non-empty array";
  }

  for (const [index, task] of formData.tasks.entries()) {
    if (!task.description || !task.outcomes) {
      return `Task at index ${index} is missing description or outcomes`;
    }
  }

  return null;
}

// ─── NEW: lookup by email ─────────────────────────────────
// GET /api/form/email/:email
router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const form  = await InternshipRequest.findOne({ "student.email": email });
    if (!form) {
      return res.status(404).json({ error: "No internship request found for that email" });
    }
    res.json(form);
  } catch (err) {
    console.error("GET /api/form/email error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── NEW: lookup by Sooner ID ─────────────────────────────
// GET /api/form/student/:soonerId
router.get("/student/:soonerId", async (req, res) => {
  try {
    const soonerId = req.params.soonerId.trim();
    const form     = await InternshipRequest.findOne({ "student.soonerId": soonerId });
    if (!form) {
      return res.status(404).json({ error: "No internship request found for that Sooner ID" });
    }
    res.json(form);
  } catch (err) {
    console.error("GET /api/form/student error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── NEW: fetch by form _id ───────────────────────────────
// GET /api/form/:id
router.get("/:id", async (req, res) => {
  try {
    const form = await InternshipRequest.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.json(form);
  } catch (err) {
    console.error("GET /api/form/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── YOUR EXISTING SUBMIT ROUTE ───────────────────────────
// POST /api/form/submit
router.post("/submit", async (req, res) => {
  const formData = req.body;
  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await insertFormData(formData);
    res.status(200).json({ message: "Form received and handled!" });
  } catch (error) {
    console.error("Error handling form data:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
