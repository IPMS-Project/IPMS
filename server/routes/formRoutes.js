const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const { insertFormData } = require("../services/insertData");


router.get("/internshiprequests", async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      supervisor_status: "pending",
      
      supervisor_status: { $in: [null, "pending"] } // not yet reviewed by supervisor
    }).sort({ createdAt: 1 })  .populate("student", "userName")  // oldest first

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching internship requests:", err);
    res.status(500).json({ message: "Server error while fetching internship requests" });
  }
});

// Validate required fields
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
    if (!formData[field] || formData[field] === '') {
      return `Missing or empty required field: ${field}`;
    }
  }


  if (!Array.isArray(formData.tasks) || formData.tasks.length === 0) {
    return 'Tasks must be a non-empty array';
  }
  
  const tasks = formData.tasks;
  console.log(tasks);
  if (tasks.filter((task) => task.description && task.description.trim() !== '').length < 3)
    return 'At least 3 tasks must be provided';
  const uniqueOutcomes = new Set();
  tasks.forEach((task) => {
    if (Array.isArray(task.outcomes)) {
      task.outcomes.forEach(outcome => uniqueOutcomes.add(outcome));
    } 
  });
  formData.status = uniqueOutcomes.size < 3 ? 'pending manual review' : 'submitted';
  return null;
}


router.post('/submit', async (req, res) => {
  const formData = req.body;
  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await insertFormData(formData);
    res.status(200).json({ message: 'Form received and handled!', manual: formData.status !== 'submitted'});
  } catch (error) {
    console.error('Error handling form data:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
