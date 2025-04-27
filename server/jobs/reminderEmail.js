const emailService = require("../services/emailService");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const InternshipRequest = require("../models/InternshipRequest");
const UserTokenRequest = require("../models/TokenRequest");
const logger = require("../utils/logger");
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
  const fiveWorkingDaysAgo = now.subtract(7, "day").toDate();

  try {
    const pendingSubs = await getAllForms({
      supervisor_status: "pending",
      createdAt: { $lt: fiveWorkingDaysAgo },
    });

    const supervisors = await UserTokenRequest.find({
      role: "supervisor",
      isActivated: true,
    });

    for (const submission of pendingSubs) {
      const student = await User.findById(submission.student_id);
      const supervisor = await User.findById(submission.supervisor_id);

      if (!student || !supervisor) continue;

      const reminderCount = submission.supervisor_reminder_count || 0;
      const lastReminded =
        submission.last_supervisor_reminder_at || submission.createdAt;
      const nextReminderDue = dayjs(lastReminded).add(5, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain) {
        await emailService.sendEmail({
          to: student.email,
          subject: `Supervisor Not Responding for "${submission.name}"`,
          html: `<p>Your submission "<strong>${submission.name}</strong>" has not been reviewed by your supervisor after multiple reminders.</p>
                 <p>Please consider resending or deleting the request.</p>`,
          text: `Your submission "${submission.name}" is still awaiting supervisor review.`,
        });

        await NotificationLog.create({
          submissionId: submission._id,
          type: "studentEscalation",
          recipientEmail: student.email,
          message: `Student notified about supervisor inaction for "${submission.name}".`,
        });

        logger.info(`[Escalated] Student notified for: "${submission.name}"`);
      } else if (shouldRemindAgain) {
        for (const sup of supervisors) {
          await emailService.sendEmail({
            to: sup.ouEmail,
            subject: `Reminder: Please Review Submission "${submission._id}"`,
            html: `<p>This is a reminder to review the submission by ${student.email}.</p>`,
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

        logger.info(
          `[Reminder Sent] Supervisor: "${supervisor.email}" for "${submission.name}"`
        );
      }
    }
  } catch (err) {
    logger.error("[SupervisorReminder Error]:", err.message || err);
  }
};

module.exports = {
  coordinatorReminder,
  supervisorReminder,
};
