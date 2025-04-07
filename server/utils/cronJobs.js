/**
 * cronJobs.js - Centralized cron job registrations
 *
 * This file contains all the cron job registrations for the application.
 * Jobs registered here will be automatically started when the server starts.
 */

const cronJobManager = require("./cronUtils");
const emailService = require("../services/emailService");

// Daily report email job - runs at 8:00 AM every day
cronJobManager.registerJob(
  "dailyReportEmail",
  "0 8 * * *", // Run every day at 8:00 AM
  async () => {
    try {
      await emailService.sendEmail({
        to: "admin@example.com",
        subject: "Daily System Report",
        html: "<h1>Daily Report</h1><p>This is the daily system report.</p>",
      });
    } catch (error) {
      console.error("Failed to send daily report email:", error);
    }
  },
  {
    timezone: "America/New_York",
    runOnInit: false,
  }
);

// Weekly database cleanup - runs at midnight on Sunday
cronJobManager.registerJob(
  "weeklyDatabaseCleanup",
  "0 0 * * 0", // Run at midnight on Sunday
  async () => {
    try {
      console.log("Performing weekly database cleanup...");
      // Add your database cleanup logic here
      console.log("Database cleanup completed");
    } catch (error) {
      console.error("Database cleanup failed:", error);
    }
  }
);

// Hourly system status check
cronJobManager.registerJob(
  "hourlyStatusCheck",
  "0 * * * *", // Run every hour
  async () => {
    try {
      console.log("Performing hourly system status check...");
      // Add your system health check logic here
      const systemOk = true; // Replace with actual checks

      if (!systemOk) {
        await emailService.sendEmail({
          to: "admin@example.com",
          subject: "ALERT: System Status Issue",
          html: "<h1>System Alert</h1><p>An issue was detected during routine status check.</p>",
        });
      }
    } catch (error) {
      console.error("Hourly status check failed:", error);
    }
  }
);

console.log("All cron jobs have been registered successfully!");
