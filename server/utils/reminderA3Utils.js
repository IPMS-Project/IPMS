// Author: Subhash Chandra
// server/utils/reminderA3Utils.js

const cronJobManager = require("./cronUtils");
const Evaluation = require("../models/Evaluation");
const emailService = require("../services/emailService");
const logger = require("./logger");
const dayjs = require("dayjs");

// Register the Reminder Job for Form A.3
async function registerReminderA3Job() {
  cronJobManager.registerJob(
    "A3Reminder",
    "0 9 * * *", // ⏰ Every day at 9:00 AM (Production)
    async () => {
      try {
        const threeDaysAgo = dayjs().subtract(3, "day").toDate();
        const oneDayAgo = dayjs().subtract(1, "day").toDate();

        // Find draft evaluations older than 3 days and not reminded in last 1 day
        const draftEvaluations = await Evaluation.find({
          status: "draft",
          createdAt: { $lt: threeDaysAgo },
          $or: [
            { lastReminderSentAt: { $exists: false } },
            { lastReminderSentAt: { $lt: oneDayAgo } }
          ]
        });

        logger.info(`Found ${draftEvaluations.length} draft Form A.3 evaluations older than 3 days.`);

        for (const evaluation of draftEvaluations) {
          const toEmail = evaluation.interneeEmail;

          if (!toEmail) {
            logger.warn(`Skipping reminder: missing email for evaluation ID: ${evaluation._id}`);
            continue;
          }

          const subject = `Reminder: Final Job Evaluation Form A.3 Pending Submission`;
          const link = "https://yourdomain.com/form/A3"; // 🔒 Replace with production link

          const html = `
            <p>Dear ${evaluation.interneeName || "Internee"},</p>
            <p>This is a reminder to submit your Final Job Performance Evaluation (Form A.3).</p>
            <p>Please complete it as soon as possible by visiting the form:</p>
            <a href="${link}">${link}</a>
            <p>Regards,<br/>IPMS Team</p>
          `;

          await emailService.sendEmail({
            to: toEmail,
            subject,
            html,
            text: `Please complete your A.3 form: ${link}`,
          });

          logger.info(`Reminder email sent to: ${toEmail}`);

          // ✅ Update reminder timestamp only (safe update, no validation triggered)
          await Evaluation.updateOne(
            { _id: evaluation._id },
            { $set: { lastReminderSentAt: new Date() } }
          );
        }
      } catch (err) {
        logger.error("Reminder job for A.3 failed: " + err.message);
      }
    },
    {
      timezone: "America/Chicago",
      runOnInit: false // 🚫 Do not trigger immediately in production
    }
  );
}

module.exports = {
  registerReminderA3Job
};
