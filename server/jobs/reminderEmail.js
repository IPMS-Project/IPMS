const emailService = require("../services/emailService");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");
const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const logger = require("../utils/logger");
const dayjs = require("dayjs");

// ================================================
// Utility: Fetch All Forms for Reminders
// ================================================
const getAllForms = async (filter = {}) => {
  const formPromises = [
    InternshipRequest.find(filter),
    WeeklyReport.find(filter),
    Evaluation.find(filter),
  ];
  const allResults = await Promise.all(formPromises);
  return allResults.flat();
};

// ================================================
// Coordinator Reminders
// ================================================
const coordinatorReminder = async () => {
  const now = dayjs();
  const fiveDaysAgo = now.subtract(7, "day").toDate(); // ~5 working days
  const threeDaysAgo = now.subtract(3, "day").toDate(); // 3 days for A3

  try {
    // A1 and A2 pending forms (5 days)
    const pendingA1A2 = await InternshipRequest.find({
      coordinator_status: "pending",
      supervisor_status: "approved",
      createdAt: { $lt: fiveDaysAgo },
    });

    const pendingWeeklyReports = await WeeklyReport.find({
      coordinator_status: "pending",
      supervisor_status: "approved",
      createdAt: { $lt: fiveDaysAgo },
    });

    // A3 pending evaluations (3 days)
    const pendingEvaluations = await Evaluation.find({
      advisorAgreement: true,
      coordinatorAgreement: { $exists: false },
      createdAt: { $lt: threeDaysAgo },
    });

    await sendCoordinatorReminder(pendingA1A2, 5, now, "A1 Internship Request");
    await sendCoordinatorReminder(
      pendingWeeklyReports,
      5,
      now,
      "A2 Weekly Report"
    );
    await sendCoordinatorReminder(
      pendingEvaluations,
      3,
      now,
      "A3 Job Evaluation"
    );
  } catch (err) {
    logger.error("❌ Error in coordinatorReminder:", err.message);
  }
};

const sendCoordinatorReminder = async (forms, nextDueInDays, now, formType) => {
  for (const form of forms) {
    try {
      const reminderCount = form.coordinator_reminder_count || 0;
      const lastReminded = form.last_coordinator_reminder_at || form.createdAt;
      const nextReminderDue = dayjs(lastReminded).add(nextDueInDays, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (!shouldRemindAgain) continue;

      const student = await UserTokenRequest.findById(form.student_id);
      const coordinator = await UserTokenRequest.findById(form.coordinator_id);

      if (!student || !coordinator) continue;

      if (reminderCount >= 2 && !form.studentNotified) {
        // Escalate to student
        await emailService.sendEmail({
          to: student.ouEmail,
          subject: `Coordinator Not Responding - ${formType}`,
          html: `<p>Your ${formType} has not been approved even after multiple reminders.</p>
                 <p>You can now <strong>resend</strong> or <strong>delete</strong> your submission if needed.</p>`,
        });

        await NotificationLog.create({
          submission_id: form._id,
          type: "studentEscalation",
          recipient_email: student.ouEmail,
          message: `Escalation: Student notified about delayed ${formType} approval`,
        });

        form.studentNotified = true;
      } else {
        // Send reminder to Coordinator
        await emailService.sendEmail({
          to: coordinator.ouEmail,
          subject: `Reminder: Action Needed on ${formType}`,
          html: `<p>Please review and approve the pending ${formType} form submitted by the student.</p>`,
        });

        form.coordinator_reminder_count = reminderCount + 1;
      }

      form.last_coordinator_reminder_at = new Date();
      await form.save();
      logger.info(`✅ Reminder sent for ${formType}: Form ID ${form._id}`);
    } catch (err) {
      logger.error(
        `❌ Error sending coordinator reminder for ${formType}:`,
        err.message
      );
    }
  }
};

// ================================================
// Supervisor Reminders
// ================================================
const supervisorReminder = async () => {
  const now = dayjs();
  const fiveDaysAgo = now.subtract(7, "day").toDate();

  try {
    const pendingSubs = await getAllForms({
      supervisor_status: "pending",
      last_supervisor_reminder_at: { $lt: fiveDaysAgo },
    });

    for (const form of pendingSubs) {
      try {
        const student = await UserTokenRequest.findById(form.student_id);
        const reminderCount = form.supervisor_reminder_count || 0;
        const lastReminded = form.last_supervisor_reminder_at || form.createdAt;
        const nextReminderDue = dayjs(lastReminded).add(5, "day");
        const shouldRemindAgain = now.isAfter(nextReminderDue);

        if (!shouldRemindAgain) continue;
        if (!student) continue;

        if (reminderCount >= 2) {
          // Escalate to student
          await emailService.sendEmail({
            to: student.ouEmail,
            subject: `Supervisor Not Responding`,
            html: `<p>Your internship form has not been reviewed by the supervisor after multiple reminders.</p>
                   <p>You may consider resending or deleting the form.</p>`,
          });

          await NotificationLog.create({
            submission_id: form._id,
            type: "studentEscalation",
            recipient_email: student.ouEmail,
            message: `Student notified about supervisor inaction`,
          });

          logger.info(
            `⚠️ Escalation sent to student for supervisor delay: Form ${form._id}`
          );
        } else {
          // Reminder to Supervisor
          const supervisors = await UserTokenRequest.find({
            role: "supervisor",
            isActivated: true,
          });

          for (const supervisor of supervisors) {
            await emailService.sendEmail({
              to: supervisor.ouEmail,
              subject: `Reminder: Please Review Internship Form`,
              html: `<p>Kindly review and approve the student's internship submission pending your action.</p>`,
            });
          }

          logger.info(`📧 Reminder sent to supervisors for Form ${form._id}`);
        }

        form.supervisor_reminder_count = reminderCount + 1;
        form.last_supervisor_reminder_at = new Date();
        await form.save();
      } catch (err) {
        logger.error(`❌ Error processing supervisor reminder:`, err.message);
      }
    }
  } catch (err) {
    logger.error("❌ Error in supervisorReminder:", err.message);
  }
};

// ================================================
// Exports
// ================================================
module.exports = {
  coordinatorReminder,
  supervisorReminder,
};
