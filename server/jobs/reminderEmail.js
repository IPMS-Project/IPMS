const emailService = require("../services/emailService");
const Submission = require("../models/Submission");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");

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

const Evaluation = require("../models/Evaluation");

const evaluationReminder = async () => {
  try {
    const pendingEvals = await Evaluation.find({
      evaluations: { $exists: false },
      advisorAgreement: true,
    });

    for (const evalDoc of pendingEvals) {
      const emailHtml = `
        <p>Dear Supervisor,</p>
        <p>This is a reminder to complete the <strong>Final Job Performance Evaluation (Form A.3)</strong> for:</p>
        <ul>
          <li><strong>Name:</strong> ${evalDoc.interneeName}</li>
          <li><strong>Sooner ID:</strong> ${evalDoc.interneeID}</li>
        </ul>
        <p>The deadline is approaching. Please use the link below to complete the evaluation:</p>
        <p><a href="${process.env.CLIENT_URL}/evaluation/${evalDoc._id}">Complete A.3 Evaluation</a></p>
        <p>Thanks,<br/>IPMS Team</p>
      `;

      await emailService.sendEmail({
        to: evalDoc.interneeEmail, // or supervisor's email if you have it
        subject: "Reminder: Pending A.3 Evaluation Submission",
        html: emailHtml,
      });

      console.log(`✅ Reminder sent for: ${evalDoc.interneeName}`);
    }
  } catch (error) {
    console.error("❌ Error sending A.3 reminders:", error);
  }
};

module.exports = {
    coordinatorReminder,
    supervisorReminder,
	evaluationReminder,
};
