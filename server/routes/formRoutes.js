const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const { insertFormData } = require("../services/insertData");

// GET route to fetch internship requests pending supervisor action
router.get("/internshiprequests", async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      status: "submitted",
      // approvals: "advisor", // advisor has approved
      supervisor_status: { $in: [null, "pending"] } // not yet reviewed by supervisor
    }).sort({ createdAt: 1 })  .populate("student", "userName")  // oldest first

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching internship requests:", err);
    res.status(500).json({ message: "Server error while fetching internship requests" });
  }
});

// Validate and submit form
function validateFormData(formData) {
  const requiredFields = [
    "workplaceName",
    "website",
    "phone",
    "advisorName",
    "advisorJobTitle",
    "advisorEmail",
    "creditHours",
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

  const outcomes = new Set();
  formData.tasks.forEach((task) => {
    task.outcomes?.forEach(o => outcomes.add(o));
  });

  formData.status = outcomes.size < 3 ? "pending manual review" : "submitted";
  return null;
}

router.post("/submit", async (req, res) => {
  const formData = req.body;

  if (!formData.studentId) {
    return res.status(400).json({ message: "Missing studentId in form data" });
  }
});

// ===================
// A3: Evaluation Form
// ===================

// Submit A3 form
router.post("/submit-a3", async (req, res) => {
  try {
    await insertFormData(formData);  // pass studentId through
    res.status(200).json({ message: "Form received and stored." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});


module.exports = router;
