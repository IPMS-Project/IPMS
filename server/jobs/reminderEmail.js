const emailService = require("../services/emailService");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const logger = require("../utils/logger"); // Replace console

const coordinatorReminder = async () => {
  await emailService.sendEmail({
    to: process.env.EMAIL_DEFAULT_SENDER,
    subject: "Reminder: Coordinator Approval Pending",
    html: "<p>This is a cron-based reminder email from IPMS.</p>",
    text: "Reminder: Coordinator Approval Pending",
  });
};

const getAllForms = async (filter) => {
    const models = {
        A1: require("../models/InternshipRequest"),
        A2: require("../models/WeeklyReport"),
        A3: require("../models/Evaluation"),
    };

    const allForms = [];
    for (const modelName in models) {
        const Model = models[modelName];
        const forms = await Model.find(filter)
                                 .populate("student_id", "userName email")
                                 .populate("supervisor_id", "userName email")
                                 .populate("coordinator_id", "userName email");
        allForms.push(...forms);
    }

    return allForms;
};

const supervisorReminder = async () => {
    const now = dayjs();
    const fiveWorkingDays = now.subtract(7, "day").toDate(); // Approximate 5 working days as 7 calendar days

    try {
	const pendingSubs = getAllForms({
            supervisor_status: "pending",
            last_supervisor_reminder_at: { $lt: fiveWorkingDays },
        });

	for (const submission of pendingSubs) {

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
		    submission_id: submission._id,
		    type: "studentEscalation",
		    recipient_email: student.email,
		    message: `Student notified about supervisor status on: "${submission.name}"`,
		});
		
		logger.info(`Returned to student for resubmit/delete: "${submission.name}"`);
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
		
		logger.info(`Reminder sent to supervisor for "${submission.name}"`);
	    }
	}
    } catch (err) {
	logger.error("Error in supervisorReminder:", err);
    }
};

module.exports = {
    coordinatorReminder,
    supervisorReminder
};
