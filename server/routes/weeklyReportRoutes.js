const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const internshipRequestController = require("../controllers/internshipRequestController");

// ---------------------- Weekly Report ----------------------
router.post("/", reportController.createReport);
router.get("/mine", reportController.getMyReports); // for current user
// Removed: router.get("/student/:userId", ...) because we now identify users via email!

// ---------------------- A1 Internship Form ----------------------
router.get("/a1/:email", internshipRequestController.getA1ByEmail);

// ------------------ Comments: Supervisor & Coordinator ------------------
router.post("/supervisor-comments", reportController.submitSupervisorComments);
router.post("/coordinator-comments", reportController.submitCoordinatorGroupComments);

// ---------------------- Cumulative Reports ----------------------
router.get("/cumulative/reports", reportController.getCumulativeReports);
router.get("/cumulative/group/:groupIndex", reportController.getCumulativeGroup);

// ---------------------- Supervisor Reviewed Groups ----------------------
router.get("/supervised-groups", reportController.getSupervisorReviewedGroups);

// ---------------------- Single Report Fetch ----------------------
router.get("/:id", reportController.getReportById);

module.exports = router;
