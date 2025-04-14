
const cron = require("node-cron");
const logger = require("./logger"); // Replace console


class CronJobManager {
  constructor() {
    this.jobs = new Map();
    this.logger = console;
    this.logger = logger;

  }

  registerJob(name, cronExpression, jobFunction, options = {}) {
    if (!cron.validate(cronExpression)) {
      this.logger.error(`Invalid cron expression: ${cronExpression}`);
      return false;
    }

    if (this.jobs.has(name)) {
      this.logger.warn(`Job '${name}' already exists. Replacing it...`);
      this.stopJob(name);
    }

    const task = cron.schedule(
      cronExpression,
      async () => {
        try {
          this.logger.info(`[CRON] Running job: ${name}`);
          await jobFunction();
          this.logger.info(`[CRON] Finished job: ${name}`);
        } catch (err) {
          this.logger.error(`[CRON] Error in job ${name}: ${err.message}`);
        }
      },
      {
        scheduled: true,
        timezone: options.timezone,
      }
    );

    this.jobs.set(name, { task, cronExpression, jobFunction, options });

    if (options.runOnInit) {
      this.logger.info(`Running job ${name} immediately on init`);
      jobFunction().catch((err) =>
        this.logger.error(`Immediate run failed for ${name}: ${err.message}`)
      );
    }

    return true;
  }

  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.task.stop();
      this.logger.info(`Stopped job: ${name}`);
    }
  }

  listJobs() {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      cronExpression: job.cronExpression,
      timezone: job.options.timezone || "default",
    }));
  }

  stopAllJobs() {
    for (const [name] of this.jobs.entries()) {
      this.stopJob(name);
    }
    this.logger.info("✅ All cron jobs stopped");
  }
  
}


const cronJobManager = new CronJobManager();
module.exports = cronJobManager;

module.exports = { cronJobManager };