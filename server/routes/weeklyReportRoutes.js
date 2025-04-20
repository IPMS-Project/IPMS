const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportController");

router.post("/", controller.createReport);
router.get("/status-by-email/:email", controller.getReportStatusByEmail);
router.get("/download/:email", controller.downloadReport);

module.exports = router;