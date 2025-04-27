const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const { insertFormData } = require("../services/insertData");

// router.post("/internshiprequests/:id/approve", approveSubmission);
// router.post("/internshiprequests/:id/reject", rejectSubmission);

// UPDATED: GET route to fetch internship requests pending supervisor action
router.get("/internshiprequests", async (req, res) => {
  try {
    const requests = await InternshipRequest.find({
      supervisor_status: "pending",
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
    'soonerId',
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

  if (!/^[0-9]{9}$/.test(formData.soonerId))
    return `Sooner ID must be a 9-digit number, not ${formData.soonerId}`;

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

router.get('/pending-requests', async (req, res) => {
  try {
    const pending = await InternshipRequest.find({ status: { $in: ['submitted', 'pending manual review'] } });
    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending submissions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/requests/:id/resend", async (req, res) => {
  try {
    const request = await InternshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Reset reminders
    request.reminders = [new Date()];
    request.coordinator_responded = false;
    request.coordinator_studentNotified = false;
    await request.save();

    // Send email to coordinator
    await emailService.sendEmail({
      to: [
        request.internshipAdvisor.email,
        request.student.email,
        "coordinator@ipms.edu"
      ],
      subject: "Internship Request Resent",
      html: `
        <p>Hello,</p>
        <p>The student <strong>${request.student.userName}</strong> has resent their internship approval request due to inactivity.</p>
        <p>Please review and take necessary action.</p>
      `
    });

    res.json({ message: "Request resent successfully" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Failed to resend request" });
  }
});
router.delete("/requests/:id", async (req, res) => {
  try {
    const deleted = await InternshipRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete request" });
  }
});
router.post("/student", async (req, res) => {
  const { ouEmail } = req.body;
  if (!ouEmail) return res.status(400).json({ message: "Missing email" });

  try {
    const request = await InternshipRequest.findOne({ "student.email": ouEmail });
    if (!request) return res.json({ approvalStatus: "not_submitted" });

    return res.json({ approvalStatus: request.status || "draft" });
  } catch (err) {
    console.error("Student route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
