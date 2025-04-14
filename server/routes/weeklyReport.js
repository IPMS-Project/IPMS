const express = require("express");
const router = express.Router();
const WeeklyReport = require("../models/WeeklyReport");

//TODO: POST /api/reports - Submit a new weekly report
router.post("/", async (req, res) => {
  try {
    const {
      studentId,
      tasksPerformed,
      challengesFaced,
      lessonsLearned,
      csOutcomes,
      status,
    } = req.body;

    // Create a new report instance
    const newReport = new WeeklyReport({
      studentId,
      tasksPerformed,
      challengesFaced,
      lessonsLearned,
      csOutcomes,
      status: status || "submitted", // default if not provided
    });

    // Save to DB
    await newReport.save();

    res.status(201).json({
      message: "Weekly report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

//TODO: GET /api/reports/:userId - Get all reports for a student
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all reports by this student
    const reports = await WeeklyReport.find({ studentId: userId }).sort({
      submittedAt: -1,
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});
module.exports = router;
