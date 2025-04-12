const CronJob = require("../models/CronJob");

const defaultJobs = [
  {
    name: "supervisorApprovalReminder",
    schedule: "0 8 * * *", // daily at 8 AM
    isActive: true,
  },
  {
    name: "coordinatorApprovalReminder",
    schedule: "0 8 * * *", // daily at 8 AM
    isActive: true,
  }
];

async function ensureCronJobsExist() {
  for (const job of defaultJobs) {
    const existing = await CronJob.findOne({ name: job.name });

    if (!existing) {
      await CronJob.create(job);
      console.log(`Created missing cron job: ${job.name}`);
    } else {
      console.log(`Cron job already exists: ${job.name}`);
    }
  }
}

module.exports = ensureCronJobsExist;
