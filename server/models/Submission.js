const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    name: {
	type: String,
	required: true
    },
    student_id: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "User",
	required: true
    },
    supervisor_id: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "User",
	required: true
    },
    coordinator_id: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "User",
	required: true
    },
    form_id: {
	type: mongoose.Schema.Types.ObjectId,
	required: true
    },
    form_type: {
	type: String,
	required: true,
	enum: ["A1", "A2", "A3", "A4"]
    },
    details: {
	type: String,
	required: true
    },
    // Supervisor fields
    supervisor_status: { type: String, default: "pending" },
    supervisor_comment: { type: String },
    supervisor_reminder_count: { type: Number, default: 0 },
    last_supervisor_reminder_at: { type: Date },
    // Coordinator fields
    coordinator_status: { type: String, default: "pending" },
    coordinator_comment: { type: String },
    coordinator_reminder_count: { type: Number, default: 0 },
    last_coordinator_reminder_at: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
