const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");
const emailService = require("../services/emailService"); // ✅ Import centralized email sender

const sendReminderMailsToSupervisors = async () => {
  try {
    const pendingReports = await WeeklyReport.find({
      supervisorComments: { $in: [null, ""] },
      createdAt: { $lte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, // older than 5 days
    });

    if (pendingReports.length === 0) {
      console.log("No pending reports found");
      return;
    }

    for (const report of pendingReports) {
      const supervisor = await User.findById(report.supervisorId);

      if (!supervisor) {
        console.warn(`Supervisor not found for report ID: ${report._id}`);
        continue;
      }

      await emailService.sendEmail({
        to: supervisor.email,
        subject: "Reminder: Pending Weekly Report Comment",
        text: `Hello ${supervisor.userName}, Please review and comment on the student's weekly report for ${report.week}.`,
        html: `<p>Hello <strong>${supervisor.userName}</strong>,</p>
               <p>Please review and comment on the student's weekly report for <strong>${report.week}</strong>.</p>`,
      });

      console.log(`Reminder sent to ${supervisor.email}`);
    }
  } catch (error) {
    console.error("Error in sending reminder mails:", error);
  }
};

module.exports = sendReminderMailsToSupervisors;
