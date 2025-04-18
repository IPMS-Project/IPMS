const emailService = require("../services/emailService");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotifLog");
const UserTokenRequest = require("../models/TokenRequest");
const logger = require("../utils/logger"); // Replace console

const coordinatorReminder = async () => {
    await emailService.sendEmail({
    to: process.env.EMAIL_DEFAULT_SENDER,
    subject: "Reminder: Coordinator Approval Pending",
    html: "<p>This is a cron-based reminder email from IPMS.</p>",
    text: "Reminder: Coordinator Approval Pending",
  });
};

const getAllForms = async (filter = {}) => {
  const models = {
    A1: require("../models/InternshipRequest"),
    A2: require("../models/WeeklyReport"),
    A3: require("../models/Evaluation"),
  };

  const formPromises = Object.entries(models).map(async ([form_type, Model]) => {
      const results = await Model.find(filter);
      return results;
  });

  const allResults = await Promise.all(formPromises);

  // Flatten the array of arrays into a single list
  return allResults.flat();
};


const supervisorReminder = async () => {
    const now = dayjs();
    const fiveWorkingDays = now.subtract(7, "day").toDate(); // Approximate 5 working days as 7 calendar days

    try {
	const pendingSubs = await getAllForms({
            supervisor_status: "pending",
            last_supervisor_reminder_at: { $lt: fiveWorkingDays },
        });

        const supervisors = await UserTokenRequest.find({
            role: "supervisor",
            isActivated: true,
        });

	for (const submission of pendingSubs) {

            const student = await UserTokenRequest.findById(submission.student_id);
            // This case is for the future with token management
            // const supervisor = await UserTokenRequest.findById(submission.supervisor_id);

	    const reminderCount = submission.supervisor_reminder_count || 0;
	    const lastReminded = submission.last_supervisor_reminder_at || submission.createdAt;

	    const nextReminderDue = dayjs(lastReminded).add(5, "day");
	    const shouldRemindAgain = now.isAfter(nextReminderDue);

	    if (reminderCount >= 2 && shouldRemindAgain) {
		// Escalate to student
		await emailService.sendEmail({
		    to: student.ouEmail,
		    subject: `Supervisor Not Responding for "${submission._id}"`,
		    html: `<p>Your submission "${submission._id}" has not been reviewed by the supervisor after multiple reminders.</p>
			<p>Please consider resending the form or deleting the request.</p>`,
		    text: `Your submission "${submission._id}" is still awaiting supervisor review.`,
		});

		// Log notification in database
		await NotificationLog.create({
		    submission_id: submission._id,
		    type: "studentEscalation",
		    recipient_email: student.ouEmail,
		    message: `Student notified about supervisor status on: "${submission._id}"`,
		});
		
		logger.info(`Returned to student for resubmit/delete: "${submission._id}"`);
	    } else if (shouldRemindAgain) {

                for (const supervisor of supervisors) {
                    await emailService.sendEmail({
                        to: supervisor.ouEmail,
                        subject: `Reminder: Please Review Submission "${submission._id}"`,
                        html: `<p>This is a reminder to review the submission by ${student.ouEmail}.</p>`,
                        text: `Reminder to review submission "${submission._id}".`,
                    });
                }
                
                /*
		// This is for the future with token management
		await emailService.sendEmail({
		    to: supervisor.ouEmail,
		    subject: `Reminder: Please Review Submission "${submission._id}"`,
		    html: `<p>This is a reminder to review the submission by ${student.ouEmail}.</p>`,
		    text: `Reminder to review submission "${submission._id}".`,
		});
                */

		// Update the document
		submission.supervisor_reminder_count = reminderCount + 1;
		submission.last_supervisor_reminder_at = new Date();

                try {
		    await submission.save();
                }
                catch (err) {
                    logger.error(`Failed to save submission: ${err.message}`);
                }
		
		logger.info(`Reminder sent to supervisor for "${submission._id}"`);
	    }
	}
    } catch (err) {
	logger.error("Error in supervisorReminder:", err.message);
    }
};

module.exports = {
    coordinatorReminder,
    supervisorReminder
};
