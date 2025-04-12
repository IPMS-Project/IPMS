const express = require("express");
const router = express.Router();
const { insertFormData } = require("../services/insertData");

let status = "";

// Validate required fields
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

  //SPRINT 2 - TASK VALIDATION
  const tasks=formData.tasks
  console.log(tasks)
  if (!Array.isArray(tasks) || tasks.length < 3) {
    console.log("You must provide b/w 3 to 5 tasks")
    return "You must provide between 3 to 5 tasks.";
  }
  const uniqueOutcomes = new Set();
  tasks.forEach((task) => {
    if (Array.isArray(task.outcomes)) {
      task.outcomes.forEach(outcome => uniqueOutcomes.add(outcome));
    } 
  });
  if (uniqueOutcomes.size < 3) {
    console.log(uniqueOutcomes)
    console.log("At least 3 unique CS outcomes must be present across all tasks. Task not aligned with CS outcomes, sending the form to coordinator for manual review")
    status="pending for manual review"
    formData.status = status;
    }
    else{
      console.log("task aligned. ")
      formData.status="submitted"// to supervisor
    }
    return null; 
  }

router.post("/submit", async (req, res) => {
  const formData = req.body;


  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    console.log("formroute",formData.status)
    await insertFormData(formData);
    res.status(200).json({ message: "Form received and handled!" ,status});
  } catch (error) {
    console.error("Error handling form data:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
