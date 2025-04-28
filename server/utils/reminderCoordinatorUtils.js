// server/utils/reminderCoordinatorUtils.js
// Author: Subhash Chandra
// Reminder system for Coordinator approval on Form A.3 (Sprint 4)
const cronJobManager = require("./cronUtils"); 
const Evaluation = require("../models/Evaluation");
const emailService = require("../services/emailService");
const logger = require("./logger");
const dayjs = require("dayjs");

function registerCoordinatorReminderJob() {
  cronJobManager.registerJob(
    "CoordinatorReminder",
    "0 9 * * *", // Every day at 9:00 AM (Production cron expression)
    async () => {
      try {
        const threeDaysAgo = dayjs().subtract(3, "day").toDate();

        // Find evaluations submitted but not yet approved
        const pendingEvaluations = await Evaluation.find({
          status: "submitted",
          updatedAt: { $lt: threeDaysAgo },
          coordinatorSignature: null // Coordinator hasn't signed yet
        });

        logger.info(`CoordinatorReminder: Found ${pendingEvaluations.length} pending submissions.`);

        for (const evaluation of pendingEvaluations) {
          const toEmail = evaluation.coordinatorEmail; // Assuming you have coordinatorEmail in the schema

          if (!toEmail) {
            logger.warn(`Skipping reminder: missing coordinator email for evaluation ID ${evaluation._id}`);
            continue;
          }

          const subject = "Approval Pending: Form A.3 Evaluation Reminder";
          const link = `https://yourdomain.com/coordinator/approval/${evaluation._id}`; // Change link properly if needed

          const html = `
            <p>Dear Coordinator,</p>
            <p>This is a reminder to approve the Form A.3 evaluation for student <strong>${evaluation.interneeName}</strong>.</p>
            <p>Please review and approve it at the following link:</p>
            <p><a href="${link}">${link}</a></p>
            <p>Thank you,<br/>IPMS Team</p>
          `;

          try {
            await emailService.sendEmail({
              to: toEmail,
              subject,
              html,
              text: `Reminder to approve Form A.3 for ${evaluation.interneeName}. Link: ${link}`,
            });

            logger.info(`CoordinatorReminder: Email sent successfully to ${toEmail} for evaluation ${evaluation._id}`);
          } catch (emailError) {
            logger.error(`CoordinatorReminder: Failed to send email to ${toEmail}: ${emailError.message}`);
          }
        }
      } catch (err) {
        logger.error("CoordinatorReminder job failed: " + err.message);
      }
    },
    {
      timezone: "America/Chicago",
      runOnInit: false //  Only run daily; don't trigger immediately
    }
  );
}

module.exports = {
  registerCoordinatorReminderJob
};
