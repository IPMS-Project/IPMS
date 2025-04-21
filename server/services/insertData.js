const mongoose = require("mongoose");
const InternshipRequest = require("../models/InternshipRequest");
const Submission =  require("../models/Submission")

async function insertFormData(formData) {
  try {
    console.log("Received Form Data:\n", JSON.stringify(formData, null, 2));

    // Assumes global mongoose connection is already established elsewhere in app
    if (formData.status === "submitted") {
      // if tasks are aligned , form will be sent to the supervisor. 
      formData.supervisor_status="pending" 
      formData.coordinator_status="not submitted"  //TBD
      console.log("Submission sent to Supervisor Dashboard.");
    } else if (formData.status === "pending manual review") {
      //if tasks are not aligned, form will be sent to coordinator. coordinator approves -> coordinator should forward to supervisor for further approval
      formData.coordinator_status="pending"
      formData.supervisor_status="not submitted"
      console.log("Task not aligned with CS Outcomes. Sent to coordinator for manual review.");
    }

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
      creditHours: parseInt(formData.creditHours),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      tasks: formData.tasks
      .map(task => ({
        description: task.description,
        outcomes: task.outcomes,
      })).filter(task => task.description.trim() !== ''), // remove empty tasks
      // status: "submitted", // Default status — adjust as needed
      // status: formData.status, // Default status — adjust as needed

      supervisor_status: formData.supervisor_status ,//function based on if tasks are aligned/not aligned with outcomes
      coordinator_status: formData.coordinator_status,
      approvals: ["advisor", "coordinator"], // TODO: Might be dynamic later
      reminders: [], // Placeholder for future reminder logic
      completedHours: parseInt(formData.creditHours) * 60, // Assuming 1 credit = 60 hours
    };

    const savedForm = await InternshipRequest.create(formattedData);
    console.log("Form saved successfully with ID:", savedForm._id);
    console.log("saved form",savedForm)
    return savedForm;

  } catch (error) {
    console.error("Error saving form:", error.message);
    throw error;
  }
}

module.exports = {
  insertFormData,
};