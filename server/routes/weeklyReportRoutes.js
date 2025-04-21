const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { getA1ByEmail } = require("../controllers/internshipRequestController");

// ---------------------- Weekly Report ----------------------
router.post("/", reportController.createReport);
router.get("/mine", reportController.getMyReports);
router.get("/student/:userId", reportController.getReportsByStudent);

//  No conflict – safely namespaced
router.get("/a1/:email", getA1ByEmail);

// ------------------ Comments: Supervisor & Coordinator ------------------
router.post("/supervisor-comments", reportController.submitSupervisorComments);
router.post("/coordinator-comments", reportController.submitCoordinatorGroupComments);

// ---------------------- Cumulative Reports ----------------------
router.get("/cumulative/reports", reportController.getCumulativeReports);
router.get("/cumulative/group/:groupIndex", reportController.getCumulativeGroup);

// ---------------------- Group Fetches ----------------------
router.get("/supervised-groups", reportController.getSupervisorReviewedGroups);

// ---------------------- Single Report (must remain last!) ----------------------
router.get("/:id", reportController.getReportById);

module.exports = router;
