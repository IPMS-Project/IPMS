const emailService = require("../services/emailService");
// const Submission = require("../models/InternshipRequest"); // ❌ Remove this
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");
const logger = require("../utils/logger");
const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const InternshipRequest = require("../models/InternshipRequest");
const dayjs = require("dayjs");

// ================= Coordinator Reminder =================
const coordinatorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDays = now.subtract(7, "day").toDate();

  try {
    const pendingSubs = await InternshipRequest.find({
      coordinator_status: "pending",
      supervisor_status: "approved",
      createdAt: { $lt: fiveWorkingDays },
    });

    for (const submission of pendingSubs) {
      const student = await User.findById(submission.student_id);
      const coordinator = await User.findById(submission.coordinator_id);

      const reminderCount = submission.coordinator_reminder_count || 0;
      const lastReminded = submission.last_coordinator_reminder_at || submission.createdAt;
      const nextReminderDue = dayjs(lastReminded).add(5, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain && !submission.studentNotified) {
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

        logger.info(`🔔 Escalation: student notified for "${submission.name}"`);
      } else if (shouldRemindAgain) {
        await emailService.sendEmail({
          to: coordinator.email,
          subject: `Reminder: Please Approve Submission "${submission.name}"`,
          html: `<p>This is a reminder to review and approve the internship submission by ${submission.student_name}.</p>`,
          text: `Reminder to approve submission "${submission.name}".`,
        });

        submission.coordinator_reminder_count = reminderCount + 1;
        submission.last_coordinator_reminder_at = new Date();
        await submission.save();

        logger.info(`📧 Reminder sent to coordinator for "${submission.name}"`);
      }
    }
  } catch (err) {
    logger.error("❌ Error in coordinatorReminder:", err.message);
  }
};

// ================= Supervisor Reminder =================
const getAllForms = async (filter = {}) => {
  const models = {
    A1: require("../models/InternshipRequest"),
    A2: require("../models/WeeklyReport"),
    A3: require("../models/Evaluation"),
  };

  const formPromises = Object.entries(models).map(async ([form_type, Model]) => {
    return await Model.find(filter);
  });

  const allResults = await Promise.all(formPromises);
  return allResults.flat();
};

const supervisorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDays = now.subtract(7, "day").toDate();

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
      const reminderCount = submission.supervisor_reminder_count || 0;
      const lastReminded = submission.last_supervisor_reminder_at || submission.createdAt;
      const nextReminderDue = dayjs(lastReminded).add(5, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain) {
        await emailService.sendEmail({
          to: student.ouEmail,
          subject: `Supervisor Not Responding for "${submission._id}"`,
          html: `<p>Your submission "${submission._id}" has not been reviewed by the supervisor after multiple reminders.</p>
                 <p>Please consider resending the form or deleting the request.</p>`,
          text: `Your submission "${submission._id}" is still awaiting supervisor review.`,
        });

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

        submission.supervisor_reminder_count = reminderCount + 1;
        submission.last_supervisor_reminder_at = new Date();

        try {
          await submission.save();
        } catch (err) {
          logger.error(`Failed to save submission: ${err.message}`);
        }

        logger.info(`Reminder sent to supervisor for "${submission._id}"`);
      }
    }
  } catch (err) {
    logger.error("Error in supervisorReminder:", err.message);
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
