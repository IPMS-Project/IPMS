const mongoose = require("mongoose");

const Task = new mongoose.Schema({
  _id: false,
  description: {
    type: String,
    required: true
  },
  outcomes: {
    type: [String],
    enum: ['problemSolving', 'solutionDevelopment', 'communication', 'decisionMaking', 'collaboration', 'application']
  }
});

const formA1 = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'UserTokenRequest'
  },
  workplace: {
    name: { type: String, required: true },
    website: String,
    phone: String
  },
  internshipAdvisor: {
    name: String,
    jobTitle: String,
    email: { type: String, required: true }
  },
  creditHours: { type: Number, required: true, enum: [1, 2, 3] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  tasks: { type: [Task], required: true },
  approvals: {
    type: [String],
    enum: ['advisor', 'coordinator']
  },
  reminders: [Date],
  completedHours: Number,
  supervisor_status: {
    type: String,
    default: "pending"
  },
  coordinator_status: {
    type: String,
    default: "pending"
  }
}, { timestamps: true });

formA1.virtual("requiredHours").get(function () {
  return this.creditHours * 60;
});

module.exports = mongoose.models.InternshipRequest || mongoose.model("InternshipRequest", formA1);
