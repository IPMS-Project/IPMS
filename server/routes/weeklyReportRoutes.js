const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// ✅ Correct Order: Static Routes First
router.post("/supervisor-comments", reportController.submitSupervisorComments);

router.get("/cumulative/reports", reportController.getCumulativeReports);
router.get("/cumulative/group/:groupIndex", reportController.getCumulativeGroup);

router.get("/:userId", reportController.getReportsByStudent);

router.post("/", reportController.createReport);

module.exports = router;
