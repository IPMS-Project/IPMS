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
//const emailService = require("../services/emailService");
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

  const formPromises = Object.entries(models).map(async ([formType, Model]) => {
    const forms = await Model.find(filter);
    return forms.map(form => ({
      ...form.toObject(),
      form_type: formType // dynamically add the type
    }));
  });

  const allForms = await Promise.all(formPromises);
    return allForms.flat(); // flatten into a single array
};

const findSupervisorFromForm = async (form) => {
    let supervisor = null;
    try {
        if (form.form_type === "A1") {
            supervisor = await UserTokenRequest.findOne({ ouEmail: form.internshipAdvisor.email });
        }
        else if (form.form_type === "A2") {
            supervisor = await UserTokenRequest.findOne({ ouEmail: form.supervisorEmail });
        }
        else if (form.form_type === "A3") {
            const internship_a1 = await InternshipRequest.findById(form.internshipId);
            supervisor = await UserTokenRequest.findOne({ ouEmail: internship_a1.internshipAdvisor.email });
        }
        else {
            logger.error(`Unknown form type: ${form.form_type}`);
        }
    }
    catch (err) {
        logger.error(`Error retrieving supervisor: ${err.message}`);
    }
    return supervisor;
}

const getStudentFromForm = async (form) => {
    let student = null;
    try {
        if (form.form_type === "A1") {
            student = await UserTokenRequest.findById(form.student);
        }
        else if (form.form_type === "A2") {
            student = await UserTokenRequest.findById(form.studentId);
        }
        else if (form.form_type === "A3") {
            student = await UserTokenRequest.findById(form.interneeId);
        }
        else {
            logger.error(`Unknown form type: ${form.form_type}`);
        }
    }
    catch (err) {
        logger.error(`Error retrieving student: ${err.message}`);
    }
    
    return student;
}

// Supervisor reminder: weekly progress reports pending review
const supervisorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDaysAgo = now.subtract(7, "day").toDate();

    try {
        const models = {
            A1: require("../models/InternshipRequest"),
            A2: require("../models/WeeklyReport"),
            A3: require("../models/Evaluation"),
        };
        
        const pendingSubs = await getAllForms({
            supervisor_status: "pending",
            last_supervisor_reminder_at: { $lt: fiveWorkingDaysAgo },
        });

      for (const submission of pendingSubs) {

          const student = await getStudentFromForm(submission);

          const reminderCount = submission.supervisor_reminder_count || 0;
          const lastReminded = submission.last_supervisor_reminder_at || submission.createdAt;
          const nextReminderDue = dayjs(lastReminded).add(5, "day");
          const shouldRemindAgain = now.isAfter(nextReminderDue);

      if (reminderCount >= 2 && shouldRemindAgain) {
        await emailService.sendEmail({
          to: student.ouEmail,
          subject: `Supervisor Not Responding for "${submission.form_type}"`,
          html: `<p>Your submission "${submission.form_type}" has not been reviewed by the supervisor after multiple reminders.</p>
                 <p>Please consider resending the form or deleting the request.</p>`,
          text: `Your submission "${submission.form_type}" is still awaiting supervisor review.`,
        });

        await NotificationLog.create({
          submissionId: submission._id,
          type: "studentEscalation",
          recipientEmail: student.email,
          message: `Student notified about supervisor inaction for "${submission._id}".`,
        });

        logger.info(`[Escalated] Student notified for: "${submission._id}"`);
      } else if (shouldRemindAgain) {

          const supervisor = await findSupervisorFromForm(submission);
          await emailService.sendEmail({
              to: supervisor?.ouEmail,
              subject: `Reminder: Please Review Submission ${submission.form_type} of ${student.fullName}`,
              html: `<p>This is a reminder to review the submission by ${student.ouEmail}.</p>`,
              text: `Reminder: Please Review Submission ${submission.form_type} of ${student.fullName}`,
          });
          
          const updatedSubmission = await models[submission.form_type].findByIdAndUpdate(
              submission._id,
              {
                  supervisor_status: "pending",
                  supervisor_reminder_count: reminderCount + 1,
                  last_supervisor_reminder_at: new Date(),
              },
          );

          logger.info(`[Reminder Sent] Supervisor: "${supervisor.ouEmail}" for "${submission._id}"`);
      }
    }
  } catch (err) {
    logger.error("[SupervisorReminder Error]:", err.message);
  }
};
const sendStudentProgressEmail = async ({ name, email, completedHours, remainingHours }) => {
  try {
    await emailService.sendEmail({
      to: email,
      subject: "Weekly Progress Update",
      html: `<p>Hi ${name},</p>
             <p>You have completed <strong>${completedHours}</strong> hours out of your required internship hours.</p>
             <p>Remaining hours: <strong>${remainingHours}</strong>.</p>
             <p>Keep up the good work!</p>`,
      text: `Hi ${name}, you have completed ${completedHours} hours. Remaining: ${remainingHours} hours.`,
    });

    console.log(`[Email Sent] Progress email sent to ${email}`);
  } catch (err) {
    console.error("[Error sending student progress email]:", err.message);
  }
};

module.exports = {
  coordinatorReminder,
  supervisorReminder,
  sendStudentProgressEmail, 
};
