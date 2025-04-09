const CronJob = require("../models/CronJob");
const cronParser = require("cron-parser");
const jobFunctions = require("../jobs/cronJobsConfig").jobFunctions;

// Validate cron schedule
function isValidCronSchedule(schedule) {
  try {
    cronParser.parseExpression(schedule);
    return true;
  } catch (error) {
    return false;
  }
}

// Get all cron jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await CronJob.find();
    res.json(jobs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cron jobs", error: error.message });
  }
};

// Create a new cron job
exports.createJob = async (req, res) => {
  try {
    const { name, schedule, options } = req.body;

    // Validate required fields
    if (!name || !schedule) {
      return res
        .status(400)
        .json({ message: "Name and schedule are required" });
    }

    // Validate job function exists
    if (!jobFunctions[name]) {
      return res
        .status(400)
        .json({
          message: "Invalid job name - no corresponding function found",
        });
    }

    // Validate cron schedule
    if (!isValidCronSchedule(schedule)) {
      return res.status(400).json({ message: "Invalid cron schedule format" });
    }

    const job = new CronJob({
      name,
      schedule,
      options: options || {},
      isActive: true,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "A job with this name already exists" });
    } else {
      res
        .status(500)
        .json({ message: "Error creating cron job", error: error.message });
    }
  }
};

// Update a cron job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule, isActive, options } = req.body;

    // Validate cron schedule if provided
    if (schedule && !isValidCronSchedule(schedule)) {
      return res.status(400).json({ message: "Invalid cron schedule format" });
    }

    const job = await CronJob.findByIdAndUpdate(
      id,
      { schedule, isActive, options },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Cron job not found" });
    }

    res.json(job);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cron job", error: error.message });
  }
};

// Delete a cron job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await CronJob.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({ message: "Cron job not found" });
    }

    res.json({ message: "Cron job deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cron job", error: error.message });
  }
};
