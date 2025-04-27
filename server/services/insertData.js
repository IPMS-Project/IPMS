const mongoose = require("mongoose");
const InternshipRequest = require("../models/InternshipRequest");
const User = require("../models/User"); // Make sure User model is imported properly
const Submission = require("../models/Submission");

async function insertFormData(formData) {
  try {
    console.log("Received Form Data:\n", JSON.stringify(formData, null, 2));

    // Dynamically find the student based on email
    const student = await User.findOne({ email: formData.email });

    if (!student) {
      throw new Error("Student not found in users collection");
    }

    const formattedData = {
      student: student._id,  // ✅ Real user's ID from database
      workplace: {
        name: formData.workplaceName,
        website: formData.website,
        phone: formData.phone,
      },
      internshipAdvisor: {
        name: formData.advisorName,
        jobTitle: formData.advisorJobTitle,
        email: formData.advisorEmail,
      },
      creditHours: parseInt(formData.creditHours),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      tasks: formData.tasks.map(task => ({
        description: task.description,
        outcomes: task.outcomes,
      })).filter(task => task.description.trim() !== ''),
      status: formData.status,
      approvals: ["advisor", "coordinator"],
      reminders: [],
      completedHours: parseInt(formData.creditHours) * 60
    };

    const savedForm = await InternshipRequest.create(formattedData);
    console.log("Form saved successfully with ID:", savedForm._id);

    if (formData.status === "submitted") {
      console.log("Submission sent to Supervisor Dashboard.");
    } else if (formData.status === "pending manual review") {
      console.log("Task not aligned with CS Outcomes. Sent to coordinator for manual review.");
    }

    return savedForm;

  } catch (error) {
    console.error("Full Error Stack:", error);
    throw error;
  }
}

module.exports = {
  insertFormData,
};
