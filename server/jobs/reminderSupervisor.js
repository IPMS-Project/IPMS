const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");
const transporter = require("../config/nodemailer");

const sendReminderMailsToSupervisors = async () => {
  try {
    const pendingReports = await WeeklyReport.find({
      supervisorComments: { $in: [null, ""] },
      createdAt: { $lte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
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

      try {
        await transporter.sendMail({
          from: `IPMS Team <${process.env.EMAIL}>`,
          to: supervisor.email,
          subject: "Reminder: Pending Weekly Report Comment",
          text: `Hello ${supervisor.userName}, Please review and comment on the student's weekly report for ${report.week}.`,
        });

        console.log(`Reminder sent to ${supervisor.email}`);
      } catch (mailError) {
        console.error(`Failed to send email to ${supervisor.email}`, mailError);
      }
    }
  } catch (error) {
    console.error("Error in sending reminder mails:", error);
  }
};

module.exports = sendReminderMailsToSupervisors;
