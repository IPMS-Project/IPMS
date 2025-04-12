const mongoose = require("mongoose");

const notifLogSchema = new mongoose.Schema({
    submission_id: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "Submission",
	required: true,
    },
    type: {
	type: String,
	enum: ["coordinatorReminder", "supervisorReminder", "studentEscalation"],
	required: true,
    },
    recipient_email: {
	type: String,
	required: true,
    },
    message: String,
    sentAt: {
	type: Date,
	default: Date.now,
    },
});

module.exports = mongoose.model("NotificationLog", notifLogSchema);

