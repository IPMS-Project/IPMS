const WeeklyReport = require("../models/WeeklyReport");

const reportController = {
  // POST /api/reports
  createReport: async (req, res) => {
    try {
      const {
        fullName,
        email,
        soonerId,
        week,
        hours,
        tasks,
        lessons,
        supervisorComments
      } = req.body;

      const numericHours = Number(hours);
      console.log("Incoming report payload:", req.body);

      if (
        !fullName ||
        !email ||
        !soonerId ||
        !week ||
        isNaN(numericHours) ||
        !tasks ||
        !lessons
      ) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be valid.",
        });
      }

      const newReport = new WeeklyReport({
        fullName,
        email,
        soonerId,
        week,
        hours: numericHours,
        tasks,
        lessons,
        supervisorComments: supervisorComments || "",
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

  // GET /api/reports/:soonerId
  getReportsByStudent: async (req, res) => {
    try {
      const { soonerId } = req.params;

      const reports = await WeeklyReport.find({ soonerId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        reports,
      });
    } catch (error) {
      console.error("Error in getReportsByStudent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve reports.",
      });
    }
  },

  // GET /api/reports/status/:soonerId
  getReportStatus: async (req, res) => {
    try {
      const { soonerId } = req.params;

      const reports = await WeeklyReport.find({ soonerId });
      const submittedHours = reports.reduce((sum, report) => sum + report.hours, 0);

      // For testing purposes, let's assume credit hours are embedded in each report (static fallback = 3)
      const creditHours = 3;
      const requiredHours = creditHours * 60;

      res.status(200).json({
        soonerId,
        creditHours,
        requiredHours,
        submittedHours,
      });
    } catch (error) {
      console.error("Error in getReportStatus:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch report status.",
      });
    }
  },
};

module.exports = reportController;
