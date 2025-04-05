/**
 * cronExample.js - Example usage of the cronUtils module
 *
 * This file demonstrates how to use the cronUtils module to create and manage cron jobs.
 * It shows several example cron job implementations that teams can reference.
 */

const cronJobManager = require("./cronUtils");
const emailService = require("../services/emailService");

// Example 1: Daily report email job
cronJobManager.registerJob(
  "dailyReportEmail",
  "0 8 * * *", // Run every day at 8:00 AM
  async () => {
    // This function would typically gather data and send a report
    try {
      await emailService.sendEmail({
        to: "admin@example.com",
        subject: "Daily System Report",
        html: "<h1>Daily Report</h1><p>This is an example daily report.</p>",
      });
    } catch (error) {
      console.error("Failed to send daily report email:", error);
    }
  },
  {
    timezone: "America/New_York", // Optional: Set timezone
    runOnInit: false, // Don't run immediately on startup
  }
);

// Example 2: Database cleanup job (weekly)
cronJobManager.registerJob(
  "weeklyDatabaseCleanup",
  "0 0 * * 0", // Run at midnight on Sunday
  async () => {
    // Example implementation for database cleanup
    try {
      // This would be your actual cleanup logic
      console.log("Performing weekly database cleanup...");
      // await someCleanupFunction();
      console.log("Database cleanup completed");
    } catch (error) {
      console.error("Database cleanup failed:", error);
    }
  }
);

// Example 3: Hourly status check
cronJobManager.registerJob(
  "hourlyStatusCheck",
  "0 * * * *", // Run every hour
  async () => {
    console.log("Performing hourly system status check...");
    // Example implementation would check system health metrics
    const systemOk = true; // This would be the result of actual checks

    if (!systemOk) {
      // Alert on issues
      await emailService.sendEmail({
        to: "admin@example.com",
        subject: "ALERT: System Status Issue",
        html: "<h1>System Alert</h1><p>An issue was detected during routine status check.</p>",
      });
    }
  }
);

// Example of how to update an existing job's schedule
// cronJobManager.updateJobSchedule('hourlyStatusCheck', '*/30 * * * *'); // Change to every 30 minutes

// Example of how to stop a job
// cronJobManager.stopJob('weeklyDatabaseCleanup');

// Example of how to restart a job
// cronJobManager.restartJob('weeklyDatabaseCleanup');

// Example of how to list all jobs
// console.log('All registered jobs:', cronJobManager.listJobs());

console.log("Cron jobs have been set up!");

// Export the configured manager for potential use elsewhere
module.exports = cronJobManager;
