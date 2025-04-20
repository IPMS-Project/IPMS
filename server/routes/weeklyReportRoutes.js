const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.post("/", reportController.createReport);
router.get("/status/:soonerId", reportController.getReportStatus);
router.get("/:soonerId", reportController.getReportsByStudent);

module.exports = router;
