const CronJob = require("../models/CronJob");
const { coordinatorReminder, supervisorReminder } = require("./reminderEmail");
const { checkAndSendReminders } = require("./tokenExpiryCheck");
const autoDeactivateCronjobs = require("./autoDeactivateCronjobs");

// Map of job names to actual handler functions
const jobFunctions = {
  coordinatorApprovalReminder: coordinatorReminder,
  supervisorApprovalReminder: supervisorReminder,
  // Add future cron jobs here
  supervisorApprovalReminder: supervisorReminder,  
  tokenExpiryReminder: checkAndSendReminders,
  autoDeactivateCronjobs: autoDeactivateCronjobs,
  // Add more job functions here as needed
};

async function getCronJobs() {
  try {
    const jobs = await CronJob.find({ isActive: true });

    return jobs.reduce((acc, job) => {
      const jobFn = jobFunctions[job.name];

      if (jobFn) {
        acc[job.name] = {
          schedule: job.schedule,
          job: async () => {
            try {
              // Update last execution time
              await CronJob.findByIdAndUpdate(job._id, {
                lastRun: new Date(),
              });

              await jobFn(); // Execute job function
              console.log(`[CronJob] ${job.name} executed at ${new Date().toISOString()}`);
            } catch (error) {
              console.error(`[CronJob Error] ${job.name}:`, error.message || error);
            }
          },
          options: job.options || {},
        };
      }

      return acc;
    }, {});
  } catch (error) {
    console.error("[CronJob Setup Error]:", error);
    return {};
  }
}

module.exports = {
  getCronJobs,
  jobFunctions,
};
