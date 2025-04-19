const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Weekly Report Routes
router.post("/", reportController.createReport);
router.get("/mine", reportController.getMyReports);
router.get("/student/:userId", reportController.getReportsByStudent);

// Cumulative
router.get("/cumulative/reports", reportController.getCumulativeReports);
router.get("/cumulative/group/:groupIndex", reportController.getCumulativeGroup);

// Supervisor Comments
router.post("/supervisor-comments", reportController.submitSupervisorComments);

// Single Report (for read-only view)
router.get("/:id", reportController.getReportById);

module.exports = router; // ✅ This is critical!
