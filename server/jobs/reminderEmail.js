const emailService = require("../services/emailService");
const Submission = require("../models/InternshipRequest");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const InternshipRequest = require("../models/InternshipRequest");
const UserTokenRequest = require("../models/TokenRequest");
const logger = require("../utils/logger");
const dayjs = require("dayjs");

// Coordinator reminder: weekly report reviewed by supervisor but not yet commented by coordinator
const coordinatorReminder = async () => {
  const now = dayjs();
  try {
    const supervisorReviews = await SupervisorReview.find({});

    for (const review of supervisorReviews) {
      const { studentId, weeks } = review;
      const reports = await WeeklyReport.find({
        studentId,
        week: { $in: weeks },
      });

      const allCoordinatorCommentsMissing = reports.every(
        (r) => !r.coordinatorComments || r.coordinatorComments.trim() === ""
      );

      if (!allCoordinatorCommentsMissing) continue;

      const coordinatorEmail = reports[0]?.coordinatorEmail;
      const studentEmail = reports[0]?.email;

      const internship = await InternshipRequest.findOne({
        email: studentEmail,
      });
      if (!internship || dayjs().isAfter(dayjs(internship.endDate))) continue;

      await emailService.sendEmail({
        to: coordinatorEmail,
        subject: `Reminder: Coordinator Review Pending (Weeks ${weeks.join(
          ", "
        )})`,
        html: `<p>Supervisor has reviewed weeks <strong>${weeks.join(
          ", "
        )}</strong>.</p>
               <p>Please add your coordinator comments in IPMS dashboard before the internship ends.</p>`,
        text: `Reminder to review weeks ${weeks.join(", ")} as coordinator.`,
      });

      logger.info(
        `[Reminder Sent] Coordinator: "${coordinatorEmail}" for weeks: ${weeks.join(
          ", "
        )}`
      );
    }
  } catch (err) {
    logger.error("[CoordinatorReminder Error]:", err.message || err);
  }
};

// Utility to get all forms of type A1, A2, A3
const getAllForms = async (filter = {}) => {
  const models = {
    A1: require("../models/InternshipRequest"),
    A2: require("../models/WeeklyReport"),
    A3: require("../models/Evaluation"),
  };

  const formPromises = Object.entries(models).map(
    async ([form_type, Model]) => {
      const results = await Model.find(filter);
      return results;
    }
  );

  const allResults = await Promise.all(formPromises);
  return allResults.flat();
};

// Supervisor reminder: weekly progress reports pending review
const supervisorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDaysAgo = now.subtract(7, "day").toDate();

  try {
    const pendingSubs = await Submission.find({
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
