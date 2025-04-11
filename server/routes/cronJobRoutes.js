const express = require("express");
const router = express.Router();
const cronJobController = require("../controllers/cronJobController");

// Get all cron jobs
router.get("/", cronJobController.getAllJobs);

// Create a new cron job
router.post("/", cronJobController.createJob);

// Update a cron job
router.put("/:id", cronJobController.updateJob);

// Delete a cron job
router.delete("/:id", cronJobController.deleteJob);

module.exports = router;
