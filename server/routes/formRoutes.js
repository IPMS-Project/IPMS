const express = require("express");
const router = express.Router();
const { insertFormData } = require("../services/insertData");

// Utility: Validate required fields
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

  // for (const [index, task] of formData.tasks.entries()) {
  //   if (!task.description || !task.outcomes) {
  //     return `Task at index ${index} is missing description or outcomes`;
  //   }
  // }
  const filledTasks = formData.tasks.entries().filter(entry => entry[1].description && entry[1].outcomes);
  if (filledTasks.length < 3)
    return `At least 3 tasks must have description and outcomes; only ${filledTasks.length} do`

  return null; // No errors
}

router.post("/submit", async (req, res) => {
  const formData = req.body;

  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await insertFormData(formData);
    res.status(200).json({ message: "Form received and handled!", manualReview: false }); // TODO
  } catch (error) {
    console.error("Error handling form data:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
