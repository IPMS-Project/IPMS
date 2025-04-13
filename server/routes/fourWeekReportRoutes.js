const express = require("express");
const router = express.Router();
const fourWeekReportController = require("../controllers/fourWeekReportController");

router.post("/", fourWeekReportController.createReport);
router.get("/:studentId", fourWeekReportController.getReports);

module.exports = router;
