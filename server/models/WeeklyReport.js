// const mongoose = require("mongoose");

// const weeklyReportSchema = new mongoose.Schema({
//   studentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Links this report to the User model
//     required: true,
//   },  week: {
//     type: String,
//     required: true,
//   },

//   hours: {
//     type: Number,
//     required: true,
//   },

//   tasks: {
//     type: String,
//     required: true,
//   },

//   lessons: {
//     type: String,
//     required: true,
//   },

//   supervisorComments: {
//     type: String,
//   },

// }, { timestamps: true });

// module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);

//   logbookWeek: {
//     type: String,
//     required: true,
//   },

//   numberOfHours: {
//     type: Number,
//     required: true,
//   },

//   tasksPerformed: {
//     type: String,
//     required: true,
//   },
//   challengesFaced: {
//     type: String,
//     required: true,
//   },
//   lessonsLearned: {
//     type: String,
//     required: true,
//   },
//   csOutcomes: {
//     type: [String], // An array of selected CS outcomes
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["draft", "submitted", "reviewed"],
//     default: "submitted", // Automatically marked submitted
//   },
//   reminderSent: {
//     type: Boolean,
//     default: false, // For Vinay's logic to update later
//   },
//   submittedAt: {
//     type: Date,
//     default: Date.now, // Automatically set submission date
//   },
// });

// module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
  studentId: {
    type: String,  // Since you are using "123456" for now
    required: true,
  },
  week: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  tasks: {
    type: String,
    required: true,
  },
  lessons: {
    type: String,
    required: true,
  },
  supervisorComments: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
