const User = require("../models/User");
const WeeklyReport = require("../models/WeeklyReport");

/**
 * Report Controller – handles weekly report submissions and retrieval
 */

const reportController = {
  // POST /api/reports
  createReport: async (req, res) => {
    try {
      const {
        studentId,
        logbookWeek,
        numberOfHours,
        tasksPerformed,
        challengesFaced,
        lessonsLearned,
        csOutcomes,
        status, // optional
      } = req.body;

      // Role-check: Only students can submit (based on their ID)
      const user = await User.findById(studentId);
      if (!user || user.role.toLowerCase() !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can submit reports.",
        });
      }

      // Basic field validation
      if (
        !logbookWeek ||
        numberOfHours === undefined ||
        isNaN(numberOfHours) ||
        !tasksPerformed ||
        !challengesFaced ||
        !lessonsLearned ||
        !csOutcomes ||
        csOutcomes.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required and must be valid.",
        });
      }

      // Save the report
      const newReport = new WeeklyReport({
        studentId,
        logbookWeek,
        numberOfHours,
        tasksPerformed,
        challengesFaced,
        lessonsLearned,
        csOutcomes,
        status: status || "submitted", // Use provided status or default to submitted
      });

      await newReport.save();

      res.status(201).json({
        success: true,
        message: "Report submitted successfully.",
      });
    } catch (error) {
      console.error("Error in createReport:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  // GET /api/reports/:userId
  getReportsByStudent: async (req, res) => {
    try {
      const { userId } = req.params;

      const reports = await WeeklyReport.find({ studentId: userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        reports,
      });
    } catch (error) {
      console.error("Error in getReportsByStudent:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve reports." });
    }
  },
};

module.exports = reportController;
