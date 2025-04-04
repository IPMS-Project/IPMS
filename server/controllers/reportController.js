const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");

/**
 * Report Controller – handles weekly report submissions and retrieval
 */

const reportController = {
  // POST /api/reports
  createReport: async (req, res) => {
    try {
      const {
        studentID,
        logbookWeek,
        numberOfHours,
        task,
        challenge,
        lesson,
        csOutcomes,
      } = req.body;

      // Role-check: Only students can submit (based on their ID)
      const user = await User.findById(studentID);
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
        !task ||
        !challenge ||
        !lesson ||
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
        studentID,
        logbookWeek,
        numberOfHours,
        task,
        challenge,
        lesson,
        csOutcomes,
      });

      await newReport.save();

      res
        .status(201)
        .json({ success: true, message: "Report submitted successfully." });
    } catch (error) {
      console.error("Error in createReport:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },

  // GET /api/reports/:userId
  getReportsByStudent: async (req, res) => {
    try {
      const { userId } = req.params;

      const reports = await WeeklyReport.find({ studentID: userId }).sort({
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
