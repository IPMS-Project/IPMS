const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Routing weekly report actions

// POST - Submit a new weekly report
router.post("/", reportController.createReport);

// GET - Fetch all reports by a specific student
router.get("/:userId", reportController.getReportsByStudent);

module.exports = router;
