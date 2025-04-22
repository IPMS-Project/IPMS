const emailService = require("../services/emailService");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotifLog");
const UserTokenRequest = require("../models/TokenRequest");
const logger = require("../utils/logger"); // Replace console

const coordinatorReminder = async () => {

const now = dayjs();
const fiveWorkingDays = now.subtract(7, "day").toDate(); // Approximate 5 working days as 7 calendar days

try {
  const pendingSubs = await Submission.find({
    coordinator_status: "pending",
    supervisor_status: "approved",
    createdAt: { $lt: fiveWorkingDays },

    await emailService.sendEmail({
    to: process.env.EMAIL_DEFAULT_SENDER,
    subject: "Reminder: Coordinator Approval Pending",
    html: "<p>This is a cron-based reminder email from IPMS.</p>",
    text: "Reminder: Coordinator Approval Pending",

  });

  for (const submission of pendingSubs) {
    const student = await User.findById(submission.student_id);
    const coordinator = await User.findById(submission.coordinator_id);

    const reminderCount = submission.coordinator_reminder_count || 0;
    const lastReminded = submission.last_coordinator_reminder_at || submission.createdAt;
    const nextReminderDue = dayjs(lastReminded).add(5, "day");
    const shouldRemindAgain = now.isAfter(nextReminderDue);

    if (reminderCount >= 2 && shouldRemindAgain && !submission.studentNotified) {
      // 🔔 Escalate to student
      await emailService.sendEmail({
        to: student.email,
        subject: `Coordinator Not Responding for "${submission.name}"`,
        html: `<p>Your submission "${submission.name}" has not been approved by the coordinator even after 2 reminders.</p>
               <p>You can now choose to <strong>resend</strong> or <strong>delete</strong> the request.</p>`,
        text: `Your submission "${submission.name}" is still awaiting coordinator approval.`,
      });

      await NotificationLog.create({
        submissionId: submission._id,
        type: "studentEscalation",
        recipientEmail: student.email,
        message: `Student notified about stalled coordinator approval for "${submission.name}"`,
      });

      submission.studentNotified = true;
      await submission.save();

      console.log(`🔔 Escalation: student notified for "${submission.name}"`);
    } else if (shouldRemindAgain) {
      // 📩 Reminder to coordinator
      await emailService.sendEmail({
        to: coordinator.email,
        subject: `Reminder: Please Approve Submission "${submission.name}"`,
        html: `<p>This is a reminder to review and approve the internship submission by ${submission.student_name}.</p>`,
        text: `Reminder to approve submission "${submission.name}".`,
      });

      submission.coordinator_reminder_count = reminderCount + 1;
      submission.last_coordinator_reminder_at = new Date();
      await submission.save();

      console.log(`📧 Reminder sent to coordinator for "${submission.name}"`);
    }
  }
} catch (err) {
  console.error("❌ Error in coordinatorReminder:", err);
}

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
  } catch (err) {
    console.error("Error in supervisorReminder:", err);
  }
};

module.exports = {
  coordinatorReminder,
  supervisorReminder,
};
