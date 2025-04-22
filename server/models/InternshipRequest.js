const mongoose = require("mongoose"); // why are we commonjs
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
            required: true,
        },
        website: String,
        phone: String, // TODO how to validate this?
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
    endDate: { // TODO how to make sure endDate is later than startDate?
        type: Date,
        required: true
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

module.exports = mongoose.models.InternshipRequest || mongoose.model("InternshipRequest", formA1);