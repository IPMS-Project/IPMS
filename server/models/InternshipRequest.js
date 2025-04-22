const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const formMetadata = require("./FormMetadata");

const Task = new mongoose.Schema({
  _id: false,
  description: {
    type: String,
    required: true,
  },
  outcomes: [{
    type: String,
    enum: [
      "problemSolving",
      "solutionDevelopment",
      "communication",
      "decisionMaking",
      "collaboration",
      "application"
    ]
  }]
  
});
const formA1 = new mongoose.Schema({
    ...formMetadata,
    student: { 
        type: ObjectId,
        required: true,
        ref: 'UserTokenRequest'
    },
    workplace: {
      name: {
        type: String,
        required: true
      },
      website: String,
      phone: String // TODO: Add validation if needed
    },
    internshipAdvisor: {
      name: String,
      jobTitle: String,
      email: {
        type: String,
        required: true
      }
    },
    creditHours: {
      type: Number,
      required: true,
      enum: [1, 2, 3]
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
      // TODO: Add custom validator to ensure endDate > startDate
    },
    tasks: {
      type: [Task],
      required: true
    },
    // status: {
    //     type: String,
    //     required: true,
    //     enum: ['draft', 'submitted','pending manual review' ,'approved']
    // },
    approvals: {
      type: [String],
      enum: ["advisor", "coordinator"],
    },
    reminders: [Date],
    // requiredHours is an easily derived attribute
    // TODO needs to be a virtual getter that checks this student's WeeklyReports
    completedHours: Number
}, { timestamps: true });
formA1.virtual("requiredHours").get(function() {
    return this.creditHours * 60;
})

module.exports = mongoose.model("InternshipRequest", formA1);