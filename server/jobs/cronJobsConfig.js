const CronJob = require("../models/CronJob");
const { coordinatorReminder, supervisorReminder } = require("./reminderEmail");
const { checkAndSendReminders } = require("./tokenExpiryCheck");

// Map of job names to their corresponding functions
const jobFunctions = {
  coordinatorApprovalReminder: coordinatorReminder,
  supervisorApprovalReminder: supervisorReminder,  
  tokenExpiryReminder: checkAndSendReminders,
  // Add more job functions here as needed
};

async function getCronJobs() {
  try {
    const jobs = await CronJob.find({ isActive: true });

    // Transform database records into the expected format
    return jobs.reduce((acc, job) => {
      if (jobFunctions[job.name]) {
        acc[job.name] = {
          schedule: job.schedule,
          job: async () => {
            try {
              // Update last run time
              await CronJob.findByIdAndUpdate(job._id, {
                lastRun: new Date(),
              });

              // Execute the job
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
