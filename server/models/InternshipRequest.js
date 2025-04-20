const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

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
  student: { // Optional if not using User ref directly
    type: ObjectId,
    ref: 'User',
    required: false
  },
  studentName: {
    type: String,
    required: true
  },
  soonerId: {
    type: String,
    required: true
  },
  supervisor_comment: { type: String },
supervisor_status: { type: String, enum: ['Approved', 'Rejected', 'Pending'] },
  studentEmail: {
    type: String,
    required: true
  },
  workplace: {
    name: {
      type: String,
      required: true,
    },
    website: String,
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      },
      required: true
    }
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
    required: true,
    validate: {
      validator: function (value) {
        return this.startDate < value;
      },
      message: "End date must be after start date"
    }
  },
  tasks: {
    type: [Task],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length >= 3;
      },
      message: "At least 3 tasks are required"
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'submitted', 'pending manual review', 'approved']
  },
  approvals: {
    type: [String],
    enum: ['advisor', 'coordinator']
  },
  reminders: [Date],
  completedHours: Number
}, { timestamps: true });

formA1.virtual("requiredHours").get(function () {
  return this.creditHours * 60;
});

module.exports = mongoose.model("InternshipRequest", formA1);
