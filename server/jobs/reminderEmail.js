const emailService = require("../services/emailService");
const Submission = require("../models/Submission");
const dayjs = require("dayjs");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");

const coordinatorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDays = now.subtract(7, "day").toDate(); // Approximate 5 working days as 7 calendar days

  try {
    const pendingSubs = await Submission.find({
      coordinator_status: "pending",
      supervisor_status: "approved",
      updatedAt: { $lt: fiveWorkingDays },
    }).populate("student_id");

    for (const submission of pendingSubs) {
      const student = submission.student_id;
      const reminderCount = submission.coordinator_reminder_count || 0;
      const lastReminded = submission.last_coordinator_reminder_at || submission.updatedAt;

      const nextReminderDue = dayjs(lastReminded).add(5, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain) {
        // Escalate to student
        await emailService.sendEmail({
          to: student.email,
          subject: `Coordinator Not Responding for "${submission.name}"`,
          html: `<p>Your submission "${submission.name}" has not been approved by the coordinator after two reminders.</p>
                 <p>Please consider resending or deleting the request from your dashboard.</p>`,
          text: `Your submission "${submission.name}" is still awaiting coordinator approval.`,
        });

        await NotificationLog.create({
          submissionId: submission._id,
          type: "studentEscalation",
          recipientEmail: student.email,
          message: `Student notified about stalled coordinator approval for "${submission.name}"`,
        });

        console.log(`Coordinator unresponsive – escalated to student for "${submission.name}"`);
      } else if (shouldRemindAgain) {
        // Send gentle reminder to coordinator
        await emailService.sendEmail({
          to: submission.coordinator_email,
          subject: `Reminder: Please Review "${submission.name}"`,
          html: `<p>This is a reminder to review the internship submission by ${submission.student_name}.</p>`,
          text: `Reminder to review "${submission.name}" submitted by ${submission.student_name}.`,
        });

        submission.coordinator_reminder_count = reminderCount + 1;
        submission.last_coordinator_reminder_at = new Date();
        await submission.save();

        console.log(`Reminder #${reminderCount + 1} sent to coordinator for "${submission.name}"`);
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
  supervisorReminder,
};
