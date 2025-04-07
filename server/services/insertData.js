const mongoose = require("mongoose");
const InternshipRequest = require("../models/InternshipRequest"); 

async function insertFormData(formData) {
  try {
    console.log(JSON.stringify(formData, null, 2));
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://localhost:27017/internshipDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    }

    const formattedData = {
      student: new mongoose.Types.ObjectId(), // To be integrated with signin ???
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
      })),
      status: "submitted",       // Default for now TBD ???
      approvals: ["advisor","coordinator"],       // default for now TBD ??
      reminders: [],             // TBD ??
      completedHours: parseInt(formData.creditHour)*60,         
    };

    const savedForm = await InternshipRequest.create(formattedData);
    console.log("Form saved successfully:", savedForm._id);

  } catch (error) {
    console.error("Error saving form:", error.message);
  }
}
module.exports = {
  insertFormData,
};

