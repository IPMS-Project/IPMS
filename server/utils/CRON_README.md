# Cron Job Utility

This utility provides a simple way to manage scheduled tasks within the application. It allows teams to add new cron jobs without modifying the core system.

## Features

- Create, manage, and monitor cron jobs
- Easy to use API for job management
- Error handling and logging
- Support for timezone-specific scheduling
- Manual job control (stop, restart, update schedules)

## Installation

The utility is already integrated into the application. It uses the `node-cron` package for scheduling.

## How to Use

### Adding a New Cron Job

To add a new cron job, use the `registerJob` method:

```javascript
const cronJobManager = require("./utils/cronUtils");

// Register a job that runs every day at midnight
cronJobManager.registerJob(
  "myJobName", // Unique name for the job
  "0 0 * * *", // Cron expression (runs at midnight every day)
  async () => {
    // Your job function implementation goes here
    console.log("Running my job!");
    await doSomething();
  },
  {
    // Optional settings
    timezone: "America/New_York", // Set timezone (optional)
    runOnInit: false, // Whether to run immediately on startup
  }
);
```

### Cron Expression Format

Cron expressions follow the standard format:

```
* * * * *
┬ ┬ ┬ ┬ ┬
│ │ │ │ │
│ │ │ │ └── day of week (0 - 6, 0 is Sunday)
│ │ │ └──── month (1 - 12)
│ │ └────── day of month (1 - 31)
│ └──────── hour (0 - 23)
└────────── minute (0 - 59)
```

Common examples:

- `0 0 * * *` - Every day at midnight
- `*/15 * * * *` - Every 15 minutes
- `0 8 * * 1-5` - Weekdays at 8:00 AM
- `0 0 1 * *` - 1st day of the month at midnight

### Managing Jobs

```javascript
// Stop a job
cronJobManager.stopJob("myJobName");

// Restart a job
cronJobManager.restartJob("myJobName");

// Update a job's schedule
cronJobManager.updateJobSchedule("myJobName", "*/30 * * * *"); // Change to every 30 minutes

// List all jobs
const allJobs = cronJobManager.listJobs();
console.log(allJobs);

// Stop all jobs (useful during graceful shutdown)
cronJobManager.stopAllJobs();
```

### Setting a Custom Logger

You can replace the default console logger with a custom one:

```javascript
const myLogger = {
  info: (message) => {
    /* custom implementation */
  },
  warn: (message) => {
    /* custom implementation */
  },
  error: (message, error) => {
    /* custom implementation */
  },
};

cronJobManager.setLogger(myLogger);
```

## API Endpoints

The cron utility also exposes REST API endpoints for monitoring and management:

- `GET /api/cron/jobs` - List all registered jobs
- `PUT /api/cron/jobs/:name` - Update a job's schedule
- `DELETE /api/cron/jobs/:name` - Stop a job
- `POST /api/cron/jobs/:name/restart` - Restart a job

## Best Practices

1. **Use descriptive names** for your jobs to make them easier to identify and manage.
2. **Implement proper error handling** within your job functions to prevent failed jobs from crashing the application.
3. **Keep job functions isolated** and focused on a single responsibility.
4. **Consider resource usage** when scheduling jobs. Avoid scheduling CPU-intensive tasks to run simultaneously.
5. **Use appropriate intervals** - don't schedule jobs to run too frequently unless necessary.
6. **Add logging** within your job functions for debugging and monitoring.

## Example

See `cronExample.js` for practical examples of how to implement different types of jobs.

```javascript
// Example from cronExample.js
cronJobManager.registerJob(
  "dailyReportEmail",
  "0 8 * * *", // Run every day at 8:00 AM
  async () => {
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
    timezone: "America/New_York",
    runOnInit: false,
  }
);
```
