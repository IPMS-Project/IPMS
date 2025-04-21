const emailService = require("../services/emailService");
const Submission = require("../models/Submission");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const InternshipRequest = require("../models/InternshipRequest");
const dayjs = require("dayjs");

// Coordinator reminder: weekly report reviewed by supervisor but not yet commented by coordinator
const coordinatorReminder = async () => {
  const now = dayjs();
  try {
    const supervisorReviews = await SupervisorReview.find({});

    for (const review of supervisorReviews) {
      const { studentId, weeks } = review;
      const reports = await WeeklyReport.find({ studentId, week: { $in: weeks } });

      const allCoordinatorCommentsMissing = reports.every(
        (r) => !r.coordinatorComments || r.coordinatorComments.trim() === ""
      );

      if (!allCoordinatorCommentsMissing) continue;

      // Fetch coordinator email from the first report (they're all the same)
      const coordinatorEmail = reports[0]?.coordinatorEmail;
      const studentEmail = reports[0]?.email;

      // Skip if end date has passed
      const internship = await InternshipRequest.findOne({ email: studentEmail });
      if (!internship || dayjs().isAfter(dayjs(internship.endDate))) continue;

      // Send reminder email
      await emailService.sendEmail({
        to: coordinatorEmail,
        subject: `Reminder: Coordinator Review Pending (Weeks ${weeks.join(", ")})`,
        html: `<p>Supervisor has reviewed weeks <strong>${weeks.join(", ")}</strong>.</p>
               <p>Please add your coordinator comments in IPMS dashboard before the internship ends.</p>`,
        text: `Reminder to review weeks ${weeks.join(", ")} as coordinator.`
      });

      console.log(`[Reminder Sent] Coordinator: "${coordinatorEmail}" for weeks: ${weeks.join(", ")}`);
    }
  } catch (err) {
    console.error("[CoordinatorReminder Error]:", err.message || err);
  }
};

// Main logic to remind supervisors if pending for > 5 days
const supervisorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDaysAgo = now.subtract(7, "day").toDate(); // Approx 5 working days

  try {
    const pendingSubs = await Submission.find({
      supervisor_status: "pending",
      createdAt: { $lt: fiveWorkingDaysAgo },
    });

    for (const submission of pendingSubs) {
      const student = await User.findById(submission.student_id);
      const supervisor = await User.findById(submission.supervisor_id);

      if (!student || !supervisor) continue;

      const reminderCount = submission.supervisor_reminder_count || 0;
      const lastReminded = submission.last_supervisor_reminder_at || submission.createdAt;
      const nextReminderDue = dayjs(lastReminded).add(5, "day");
      const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain) {
        // 🔁 Escalate to student
        await emailService.sendEmail({
          to: student.email,
          subject: `Supervisor Not Responding for "${submission.name}"`,
          html: `
            <p>Your submission "<strong>${submission.name}</strong>" has not been reviewed by your supervisor after multiple reminders.</p>
            <p>Please consider resending or deleting the request.</p>
          `,
          text: `Your submission "${submission.name}" is still awaiting supervisor review.`,
        });

        await NotificationLog.create({
          submissionId: submission._id,
          type: "studentEscalation",
          recipientEmail: student.email,
          message: `Student notified about supervisor inaction for "${submission.name}".`,
        });

        console.log(`[Escalated] Student notified for: "${submission.name}"`);
      } else if (shouldRemindAgain) {
        // 📨 Reminder to supervisor
        await emailService.sendEmail({
          to: supervisor.email,
          subject: `Reminder: Please Review Submission "${submission.name}"`,
          html: `<p>This is a reminder to review the submission by ${submission.student_name}.</p>`,
          text: `Reminder to review submission "${submission.name}".`,
        });

        submission.supervisor_reminder_count = reminderCount + 1;
        submission.last_supervisor_reminder_at = new Date();
        await submission.save();

        console.log(`[Reminder Sent] Supervisor: "${supervisor.email}" for "${submission.name}"`);
      }
    }
  } catch (err) {
    console.error("[SupervisorReminder Error]:", err.message || err);
  }
};

module.exports = {
  coordinatorReminder,
  supervisorReminder,
};
