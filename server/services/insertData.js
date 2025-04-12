const mongoose = require("mongoose");
const InternshipRequest = require("../models/InternshipRequest");

async function insertFormData(formData) {
  try {
    console.log("Received Form Data:\n", JSON.stringify(formData, null, 2));

    // Assumes global mongoose connection is already established elsewhere in app

    const formattedData = {
      student: new mongoose.Types.ObjectId(), // TODO: Replace with actual signed-in student ID
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
      creditHours: parseInt(formData.creditHour),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      tasks: formData.tasks.map(task => ({
        description: task.description,
        outcomes: task.outcomes,
      })).filter(task => task.description.trim() !== ''),
      status: "submitted", // Default status — adjust as needed
      approvals: ["advisor", "coordinator"], // TODO: Might be dynamic later
      reminders: [], // Placeholder for future reminder logic
      completedHours: parseInt(formData.creditHour) * 60, // Assuming 1 credit = 60 hours
    };

    const savedForm = await InternshipRequest.create(formattedData);
    console.log("Form saved successfully with ID:", savedForm._id);
    return savedForm;

  } catch (error) {
    console.error("Error saving form:", error.message);
    throw error;
  }
}

module.exports = {
  insertFormData,
};
