const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const { insertFormData } = require("../services/insertData");
const {
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission
} = require("../controllers/approvalController");

router.post("/internshiprequests/:id/approve", approveSubmission);
router.post("/internshiprequests/:id/reject", rejectSubmission);

// GET route to fetch internship requests without supervisor_comment and supervisor_status
router.get("/internshiprequests", async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      status: "submitted",
      approvals: { $all: ["advisor", "coordinator"] },
      supervisor_comment: { $exists: false },
      supervisor_status: { $exists: false }
    }).sort({ createdAt: -1 });

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
  const error = validateFormData(formData);
  if (error) return res.status(400).json({ message: error });

  try {
    await insertFormData(formData);
    res.status(200).json({ message: "Form received and stored." });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});


module.exports = router;
