const emailService = require("../services/emailService");
const Submission = require("../models/Submission");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");

const coordinatorReminder = async () => {
	const now = dayjs();
	const fiveWorkingDays = now.subtract(7, "day").toDate(); // Approximate 5 working days as 7 calendar days

	try {
	const pending = await Submission.find({
		coordinator_status: "pending",
		last_coordinator_reminder_at: { $lt: fiveWorkingDays },
	});

	for (const submission of pending) {
		// Fetch student and coordinator data
		const student = await User.findById(submission.student_id);
	    const coordinator = await User.findById(submission.coordinator_id);

		const reminderCount = submission.coordinator_reminder_count || 0;
		const lastReminded = submission.last_coordinator_reminder_at || submission.createdAt;

		const nextReminderDue = dayjs(lastReminded).add(7, "day");  // Approximate 5 working days as 7 calendar days
		const shouldRemindAgain = now.isAfter(nextReminderDue);
		
		if (reminderCount >= 2 && shouldRemindAgain) {
			// Escalate to student
			
			console.log(`Returned to student for resubmit/delete: "${submission.name}"`);
		} else if (shouldRemindAgain) {
			// Gentle reminder to Coordinator
			await emailService.sendEmail({
				to: coordinator.email,
				subject: `Reminder: Coordinator Approval Pending for "${submission.name}"`,
				html: `<p>This is a cron-based reminder email from IPMS to review the submission by ${submission.student_name}.</p>`,
				text: `Reminder: Coordinator Approval Pending for "${submission.name}".`,
			});

			// Update the document
			submission.coordinator_reminder_count = reminderCount + 1;
			submission.last_coordinator_reminder_at = new Date();
			await submission.save();
			
			console.log(`Reminder sent to coordinator for "${submission.name}"`);
		}
	}
	} catch (err) {
	console.error("Error in coordinatorReminder:", err);
	}

};

const supervisorReminder = async () => {
    const now = dayjs();
    const fiveWorkingDays = now.subtract(7, "day").toDate(); // Approximate 5 working days as 7 calendar days

    try {
	const pendingSubs = await Submission.find({
	    supervisor_status: "pending",
	    createdAt: { $lt: fiveWorkingDays },
	});

	for (const submission of pendingSubs) {
	    // Fetch student and supervisor data
	    const student = await User.findById(submission.student_id);
	    const supervisor = await User.findById(submission.supervisor_id);

	    const reminderCount = submission.supervisor_reminder_count || 0;
	    const lastReminded = submission.last_supervisor_reminder_at || submission.createdAt;

	    const nextReminderDue = dayjs(lastReminded).add(5, "day");
	    const shouldRemindAgain = now.isAfter(nextReminderDue);
	    
	    if (reminderCount >= 2 && shouldRemindAgain) {
		// Escalate to student
		await emailService.sendEmail({
		    to: student.email,
		    subject: `Supervisor Not Responding for "${submission.name}"`,
		    html: `<p>Your submission "${submission.name}" has not been reviewed by the supervisor after multiple reminders.</p>
			<p>Please consider resending the form or deleting the request.</p>`,
		    text: `Your submission "${submission.name}" is still awaiting supervisor review.`,
		});

		// Log notification in database
		await NotificationLog.create({
		    submissionId: submission._id,
		    type: "studentEscalation",
		    recipientEmail: student.email,
		    message: `Student notified about supervisor status on: "${submission.name}"`,
		});
		
		console.log(`Returned to student for resubmit/delete: "${submission.name}"`);
	    } else if (shouldRemindAgain) {
		// Gentle reminder to supervisor
		await emailService.sendEmail({
		    to: supervisor.email,
		    subject: `Reminder: Please Review Submission "${submission.name}"`,
		    html: `<p>This is a reminder to review the submission by ${submission.student_name}.</p>`,
		    text: `Reminder to review submission "${submission.name}".`,
		});

		// Update the document
		submission.supervisor_reminder_count = reminderCount + 1;
		submission.last_supervisor_reminder_at = new Date();
		await submission.save();
		
		console.log(`Reminder sent to supervisor for "${submission.name}"`);
	    }
	}
    } catch (err) {
	console.error("Error in supervisorReminder:", err);
    }
};

module.exports = {
    coordinatorReminder,
    supervisorReminder
};
