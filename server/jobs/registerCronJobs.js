const cronJobManager = require("../utils/cronUtils");
const { getCronJobs } = require("./cronJobsConfig");

async function registerAllJobs() {
  try {
    console.log("🔄 Fetching and registering cron jobs...");
    const cronJobs = await getCronJobs();

    if (Object.keys(cronJobs).length === 0) {
      console.warn("⚠️ No active cron jobs found in the database");
      return;
    }

    // Register all cron jobs from the configuration
    Object.entries(cronJobs).forEach(([jobName, config]) => {
      console.log(
        `📅 Registering job: ${jobName} with schedule: ${config.schedule}`
      );
      const success = cronJobManager.registerJob(
        jobName,
        config.schedule,
        config.job,
        {
          ...config.options,
          runOnInit: false, // This prevents immediate execution
        }
      );

      if (!success) {
        console.error(`❌ Failed to register job: ${jobName}`);
      }
    });
    console.log("✅ All cron jobs registered successfully");
  } catch (error) {
    console.error("❌ Error registering cron jobs:", error);
    throw error; // Re-throw to ensure the error is not silently caught
  }
}

// Export the function
module.exports = { registerAllJobs };

// Only run the auto-registration if this file is being run directly
if (require.main === module) {
  console.log("🚀 Initializing cron job registration...");
  // Register jobs immediately
  registerAllJobs()
    .then(() => {
      console.log("✅ Initial cron job registration completed");
    })
    .catch((error) => {
      console.error("❌ Failed to initialize cron jobs:", error);
      process.exit(1);
    });

  // Optionally, set up a periodic refresh of job configurations
  setInterval(() => {
    registerAllJobs()
      .then(() => console.log("✅ Cron jobs refreshed"))
      .catch((error) =>
        console.error("❌ Failed to refresh cron jobs:", error)
      );
  }, 1 * 60 * 1000); // Refresh every 1 minutes
}
