const cron = require("node-cron");

/**
 * Generic Cron Job Scheduler
 * @param {string} cronExpression - Cron format (e.g., 
 * @param {Function} jobFunction - Function to execute
 */
const scheduleJob = (cronExpression, jobFunction) => {
  cron.schedule(cronExpression, async () => {
    console.log(`[CRON] Running job at ${new Date().toLocaleString()}`);
    try {
      await jobFunction();
    } catch (err) {
      console.error(`[CRON] Job error:`, err.message);
    }
  });
};

module.exports = scheduleJob;
