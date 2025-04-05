/**
 * cronUtils.js - A reusable module for managing cron jobs
 *
 * This utility allows teams to easily add new cron jobs without modifying the core system.
 * It provides a simple interface to register functions to be executed according to
 * cron expressions.
 */

const cron = require("node-cron");

class CronJobManager {
  constructor() {
    this.jobs = new Map();
    this.logger = console; // Default to console, can be replaced with a custom logger
  }

  /**
   * Register a new cron job
   * @param {string} name - Unique name for the job
   * @param {string} cronExpression - Cron expression (e.g. '0 0 * * *' for daily at midnight)
   * @param {Function} jobFunction - The function to execute
   * @param {Object} options - Additional options
   * @param {boolean} options.runOnInit - Whether to run the job immediately when registered
   * @param {boolean} options.timezone - Timezone for the job (e.g. 'America/New_York')
   * @returns {boolean} - Success status of job registration
   */
  registerJob(name, cronExpression, jobFunction, options = {}) {
    try {
      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        this.logger.error(`Invalid cron expression: ${cronExpression}`);
        return false;
      }

      // Check if job with this name already exists
      if (this.jobs.has(name)) {
        this.logger.warn(
          `A job with name '${name}' already exists. It will be overwritten.`
        );
        this.stopJob(name);
      }

      // Create the scheduled task
      const task = cron.schedule(
        cronExpression,
        async () => {
          try {
            this.logger.info(`Running cron job: ${name}`);
            await jobFunction();
            this.logger.info(`Completed cron job: ${name}`);
          } catch (error) {
            this.logger.error(`Error in cron job ${name}:`, error);
          }
        },
        {
          scheduled: true,
          timezone: options.timezone,
        }
      );

      // Store the job
      this.jobs.set(name, { task, cronExpression, jobFunction, options });

      // Run immediately if requested
      if (options.runOnInit) {
        this.logger.info(`Running job ${name} immediately upon registration`);
        jobFunction().catch((error) => {
          this.logger.error(`Error running job ${name} immediately:`, error);
        });
      }

      this.logger.info(
        `Registered cron job: ${name} with schedule: ${cronExpression}`
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to register cron job ${name}:`, error);
      return false;
    }
  }

  /**
   * Stop a specific job by name
   * @param {string} name - Name of the job to stop
   * @returns {boolean} - Success status
   */
  stopJob(name) {
    if (!this.jobs.has(name)) {
      this.logger.warn(`No job found with name: ${name}`);
      return false;
    }

    try {
      const job = this.jobs.get(name);
      job.task.stop();
      this.logger.info(`Stopped cron job: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Error stopping job ${name}:`, error);
      return false;
    }
  }

  /**
   * Restart a specific job by name
   * @param {string} name - Name of the job to restart
   * @returns {boolean} - Success status
   */
  restartJob(name) {
    if (!this.jobs.has(name)) {
      this.logger.warn(`No job found with name: ${name}`);
      return false;
    }

    try {
      const job = this.jobs.get(name);
      job.task.start();
      this.logger.info(`Restarted cron job: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Error restarting job ${name}:`, error);
      return false;
    }
  }

  /**
   * Update an existing job's schedule
   * @param {string} name - Name of the job to update
   * @param {string} newCronExpression - New cron expression
   * @returns {boolean} - Success status
   */
  updateJobSchedule(name, newCronExpression) {
    if (!this.jobs.has(name)) {
      this.logger.warn(`No job found with name: ${name}`);
      return false;
    }

    if (!cron.validate(newCronExpression)) {
      this.logger.error(`Invalid cron expression: ${newCronExpression}`);
      return false;
    }

    try {
      // Get the existing job
      const job = this.jobs.get(name);

      // Stop the current job
      this.stopJob(name);

      // Register with the new schedule but same function and options
      return this.registerJob(
        name,
        newCronExpression,
        job.jobFunction,
        job.options
      );
    } catch (error) {
      this.logger.error(`Error updating job schedule for ${name}:`, error);
      return false;
    }
  }

  /**
   * List all registered jobs
   * @returns {Array} - Array of job information objects
   */
  listJobs() {
    const jobsList = [];

    for (const [name, job] of this.jobs.entries()) {
      jobsList.push({
        name,
        cronExpression: job.cronExpression,
        status: job.task.getStatus(),
        options: job.options,
      });
    }

    return jobsList;
  }

  /**
   * Stop all running jobs
   */
  stopAllJobs() {
    for (const [name] of this.jobs.entries()) {
      this.stopJob(name);
    }
    this.logger.info("All cron jobs stopped");
  }

  /**
   * Set a custom logger for the cron manager
   * @param {Object} logger - Logger object with info, warn, and error methods
   */
  setLogger(logger) {
    if (
      logger &&
      typeof logger.info === "function" &&
      typeof logger.warn === "function" &&
      typeof logger.error === "function"
    ) {
      this.logger = logger;
    } else {
      console.warn("Invalid logger provided. Using default logger.");
      this.logger = console;
    }
  }
}

// Create and export a singleton instance
const cronJobManager = new CronJobManager();
module.exports = cronJobManager;
