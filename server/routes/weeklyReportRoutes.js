// server/routes/weeklyReportRoutes.js

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const internshipRequestController = require("../controllers/internshipRequestController");

// ---------------------- Weekly Report ----------------------
router.post("/", reportController.createReport); // Create new report
router.get("/mine", reportController.getMyReports); // Fetch my reports

// ---------------------- A1 Internship Form ----------------------
router.get("/a1/:email", internshipRequestController.getA1ByEmail);

// ---------------------- Comments: Supervisor & Coordinator ----------------------
router.post("/supervisor-comments", reportController.submitSupervisorComments);
router.post("/coordinator-comments", reportController.submitCoordinatorComments); // ✅ Fixed this

// ---------------------- Cumulative Reports ----------------------
router.get("/cumulative", reportController.getCumulativeReports);
router.get("/cumulative/group/:groupIndex", reportController.getCumulativeGroup);

// ---------------------- Supervisor Reviewed Groups ----------------------
router.get("/supervised-groups", reportController.getSupervisorReviewedGroups);

// ---------------------- Coordinator Reviewed Groups ----------------------
router.get("/coordinator-reviewed-groups", reportController.getCoordinatorReviewedGroups);

// ---------------------- Fetch Group for Review ----------------------
router.post("/fetch-group", reportController.fetchGroupByEmailAndWeeks);

// ---------------------- Single Weekly Report Fetch ----------------------
router.get("/:id", reportController.getReportById);

module.exports = router;
