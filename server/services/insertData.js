const mongoose = require("mongoose");
const InternshipRequest = require("../models/InternshipRequest");

async function insertFormData(formData) {
  try {
    console.log("Received Form Data:\n", JSON.stringify(formData, null, 2));

    // Assumes global mongoose connection is already established elsewhere in app

    // Determine final status based on outcome analysis
    const finalStatus = formData.status || "submitted";

    const formattedData = {
      student: new mongoose.Types.ObjectId(formData.studentId), // ✅ use the actual student
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
      tasks: formData.tasks
        .map(task => ({
          description: task.description,
          outcomes: task.outcomes,
        }))
        .filter(task => task.description.trim() !== ""), // remove empty tasks
      status: finalStatus,
      approvals: finalStatus === "submitted" ? ["advisor"] : [], // 👈 KEY FIX
      reminders: [],
      completedHours: parseInt(formData.creditHours) * 60, // Assuming 1 credit = 60 hours
    };

    const savedForm = await InternshipRequest.create(formattedData);
    console.log("Form saved successfully with ID:", savedForm._id);

    if (finalStatus === "submitted") {
      // optionally create submission doc if needed
      console.log("Submission sent to Supervisor Dashboard.");
    } else if (finalStatus === "pending manual review") {
      console.log("Task not aligned with CS Outcomes. Sent to coordinator for manual review.");
    }

    return savedForm;
  } catch (error) {
    console.error("Error saving form:", error.message);
    throw error;
  }
}

module.exports = {
  insertFormData,
};
