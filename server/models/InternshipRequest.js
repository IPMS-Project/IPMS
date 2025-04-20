// server/models/InternshipRequest.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// ─── STUDENT SUB‐SCHEMA ──────────────────────────────────────
const studentSchema = new Schema(
  {
    name:     { type: String, required: true },
    soonerId: { type: String, required: true },
    email:    { type: String, required: true },
  },
  { _id: false }
);

// ─── TASK SUB‐SCHEMA ─────────────────────────────────────────
const taskSchema = new Schema(
  {
    _id: false,
    description: { type: String, required: true },
    outcomes: {
      type: [String],
      enum: [
        "problemSolving",
        "solutionDevelopment",
        "communication",
        "decisionMaking",
        "collaboration",
        "application",
      ],
    },
  },
  { _id: false }
);

// ─── MAIN A.1 SCHEMA ──────────────────────────────────────────
const internshipRequestSchema = new Schema(
  {
    student:           { type: studentSchema, required: true },
    workplace: {
      name:    { type: String, required: true },
      website: String,
      phone:   String,
    },
    internshipAdvisor: {
      name:     String,
      jobTitle: String,
      email:    { type: String, required: true },
    },
    creditHours: { type: Number, required: true, enum: [1, 2, 3] },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date, required: true },
    tasks:       { type: [taskSchema], required: true },
    status: {
      type: String,
      required: true,
      enum: ["draft", "submitted", "pending manual review", "approved"],
    },
    approvals:      { type: [String], enum: ["advisor", "coordinator"] },
    reminders:      [Date],
    completedHours: Number,
  },
  { timestamps: true }
);

internshipRequestSchema.virtual("requiredHours").get(function () {
  return this.creditHours * 60;
});

module.exports = mongoose.model(
  "InternshipRequest",
  internshipRequestSchema
);
