const emailService = require("../services/emailService");
const Submission = require("../models/Submission");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotificationLog");

const coordinatorReminder = async () => {
  await emailService.sendEmail({
    to: process.env.EMAIL_DEFAULT_SENDER,
    subject: "Reminder: Coordinator Approval Pending",
    html: "<p>This is a cron-based reminder email from IPMS.</p>",
    text: "Reminder: Coordinator Approval Pending",
  });
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

      try { const student = await User.findById(submission.student_id); }
      catch (err) { console.error("Error fetching student data:", err); }

      try { const supervisor = await User.findById(submission.supervisor_id); }
      catch (err) { console.error("Error fetching supervisor data:", err); }
	
      const reminderCount = submission.supervisor_reminder_count || 0;
      const lastReminded = submission.last_supervisor_reminder_at || submission.createdAt;

      const nextReminderDue = dayjs(lastReminded).add(5, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain) {
        // Escalate to student
        await emailService.sendEmail({
          to: student.email || process.env.EMAIL_DEFAULT_SENDER,
          subject: `Supervisor Not Responding for "${submission.name}"`,
          html: `<p>Your submission "${submission.name}" has not been reviewed by the supervisor after multiple reminders.</p><p>Please consider resending the form or deleting the request.</p>`,
          text: `Your submission "${submission.name}" is still awaiting supervisor review.`,
        });

	// Log in database the notification
	await NotificationLog.create({
	  submissionId: submission._id,
	  type: "studentEscalation",
	  recipientEmail: student.email || process.env.EMAIL_DEFAULT_SENDER,
	  message: `Student notified for escalation on submission "${submission.name}"`,
	});
	  
        console.log(`Escalated to student for submission "${submission.name}"`);
      } else if (shouldRemindAgain) {
        // Gentle reminder to supervisor
        await emailService.sendEmail({
          to: supervisor.email || process.env.EMAIL_DEFAULT_SENDER,
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
