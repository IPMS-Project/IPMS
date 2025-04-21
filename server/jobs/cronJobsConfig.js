const CronJob = require("../models/CronJob");

// Import ALL required reminder jobs from all branches
const {
  coordinatorReminder,
  supervisorReminder,
  evaluationReminder,
} = require("./reminderEmail");

const { checkAndSendReminders } = require("./tokenExpiryCheck");
const autoDeactivateCronjobs = require("./autoDeactivateCronjobs");

// Merge all job functions into one map
const jobFunctions = {
  coordinatorApprovalReminder: coordinatorReminder,
  supervisorApprovalReminder: supervisorReminder,
  evaluationReminderJob: evaluationReminder, // 👈 Sprint 3 task
  tokenExpiryReminder: checkAndSendReminders,
  autoDeactivateCronjobs: autoDeactivateCronjobs,
  // Add more job functions here as needed
};

async function getCronJobs() {
  try {
    const jobs = await CronJob.find({ isActive: true });

    return jobs.reduce((acc, job) => {
      if (jobFunctions[job.name]) {
        acc[job.name] = {
          schedule: job.schedule,
          job: async () => {
            try {
              await CronJob.findByIdAndUpdate(job._id, {
                lastRun: new Date(),
              });
              await jobFunctions[job.name]();
            } catch (error) {
              console.error(`Error executing job ${job.name}:`, error);
            }
          },
          options: job.options,
        };
      }
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching cron jobs:", error);
    return {};
  }
}

module.exports = {
  getCronJobs,
  jobFunctions,
};
