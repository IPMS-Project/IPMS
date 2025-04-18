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

// UPDATED: GET route to fetch internship requests pending supervisor action
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

// Validate required fields
function validateFormData(formData) {
  const requiredFields = [
    'workplaceName',
    'website',
    'phone',
    'advisorName',
    'advisorJobTitle',
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
  // for (const [index, task] of formData.tasks.entries()) {
  //   if (!task.description || !task.outcomes) {
  //     return `Task at index ${index} is missing description or outcomes`;
  //   }
  // }

  // uncomment below if student has to fill in task outcomes
  // const filledTasks = formData.tasks.filter((task) => task.description && task.outcomes );  
  // if (filledTasks.length < 3)
  //   return `At least 3 tasks must have description and outcomes; only ${filledTasks.length} do`;

  const tasks = formData.tasks;
  console.log(tasks);
  if (tasks.filter((task) => task.description).length < 3)
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
    res.status(200).json({ message: 'Form received and handled!', status, manual: formData.status !== 'submitted'});
  } catch (error) {
    console.error('Error handling form data:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;