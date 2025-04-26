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

const supervisorReminder = async () => {
  const now = dayjs();
  const fiveWorkingDays = now.subtract(7, "day").toDate();

    try {
        const models = {
            A1: require("../models/InternshipRequest"),
            A2: require("../models/WeeklyReport"),
            A3: require("../models/Evaluation"),
        };
        
        const pendingSubs = await getAllForms({
            supervisor_status: "pending",
            last_supervisor_reminder_at: { $lt: fiveWorkingDays },
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
          submission_id: submission._id,
          type: "studentEscalation",
          recipient_email: student.ouEmail,
          message: `Student notified about supervisor status on: "${submission._id}"`,
        });

        logger.info(`Returned to student for resubmit/delete: "${submission._id}"`);
      } else if (shouldRemindAgain) {

          const supervisor = await findSupervisorFromForm(submission);
          await emailService.sendEmail({
            to: supervisor?.ouEmail,
            subject: `Reminder: Please Review Submission "${submission._id}"`,
            html: `<p>This is a reminder to review the submission by ${student.ouEmail}.</p>`,
            text: `Reminder to review submission "${submission._id}".`,
          });

      
          const updatedSubmission = await models[submission.form_type].findByIdAndUpdate(
              submission._id,
              {
                  supervisor_status: "pending",
                  supervisor_reminder_count: reminderCount + 1,
                  last_supervisor_reminder_at: new Date(),
              },
          );

        logger.info(`Reminder sent to supervisor for "${submission._id}"`);
      }
    }
  } catch (err) {
    logger.error("Error in supervisorReminder:", err.message);
  }
};

module.exports = {
  coordinatorReminder,
  supervisorReminder,
};
