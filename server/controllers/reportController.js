const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");

const STATIC_USER_ID = "vikash123";

const reportController = {
  
  // POST - Submit Weekly Report
  createReport: async (req, res) => {
    try {
      const { week, hours, tasks, lessons } = req.body;

      if (!week || hours === undefined || isNaN(hours) || !tasks || !lessons) {
        return res.status(400).json({ success: false, message: "All required fields must be valid." });
      }

      const newReport = new WeeklyReport({
        studentId: STATIC_USER_ID,
        week,
        hours,
        tasks,
        lessons,
        supervisorComments: "",
      });

      await newReport.save();

      return res.status(201).json({ success: true, message: "Weekly report submitted successfully." });

    } catch (error) {
      console.error("Error in createReport:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  },


  // GET - Fetch Reports for a Student
  getReportsByStudent: async (req, res) => {
    try {
      const { userId } = req.params;
      const reports = await WeeklyReport.find({ studentId: userId }).sort({ week: 1 });

      return res.status(200).json({ success: true, reports });

    } catch (error) {
      console.error("Error in getReportsByStudent:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch reports." });
    }
  },


  // GET - Fetch all Cumulative Reports (excluding already reviewed)
  getCumulativeReports: async (req, res) => {
    try {
      const reports = await WeeklyReport.find({ studentId: STATIC_USER_ID }).sort({ createdAt: 1 });

      if (!reports.length) {
        return res.status(200).json({ success: true, cumulativeReports: [] });
      }

      const groupedReports = [];

      for (let i = 0; i < reports.length; i += 4) {
        const groupIndex = i / 4;

        const isReviewed = await SupervisorReview.findOne({
          studentId: STATIC_USER_ID,
          groupIndex,
        });

        if (isReviewed) continue; // Skip already reviewed groups

        groupedReports.push({
          groupIndex,
          weeks: reports.slice(i, i + 4).map(r => r.week),
          reports: reports.slice(i, i + 4),
        });
      }

      return res.status(200).json({ success: true, cumulativeReports: groupedReports });

    } catch (error) {
      console.error("Error in getCumulativeReports:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  },


  // GET - Fetch a Specific Group by groupIndex
  getCumulativeGroup: async (req, res) => {
    try {
      const { groupIndex } = req.params;
      const index = parseInt(groupIndex);

      const reports = await WeeklyReport.find({ studentId: STATIC_USER_ID }).sort({ createdAt: 1 });

      if (!reports.length) {
        return res.status(404).json({ success: false, message: "No reports found." });
      }

      const groupedReports = [];
      for (let i = 0; i < reports.length; i += 4) {
        groupedReports.push({
          groupIndex: i / 4,
          weeks: reports.slice(i, i + 4).map(r => r.week),
          reports: reports.slice(i, i + 4),
        });
      }

      const targetGroup = groupedReports[index];
      if (!targetGroup) {
        return res.status(404).json({ success: false, message: "Group not found." });
      }

      return res.status(200).json({ success: true, group: targetGroup });

    } catch (error) {
      console.error("Error in getCumulativeGroup:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  },


  // POST - Submit Supervisor Comment for a Group
  submitSupervisorComments: async (req, res) => {
    try {
      const { groupIndex, comments, weeks } = req.body;

      if (!comments || !weeks || weeks.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid comment data." });
      }

      const newReview = new SupervisorReview({
        studentId: STATIC_USER_ID,
        groupIndex,
        weeks,
        comments,
      });

      await newReview.save();

      return res.status(200).json({ success: true, message: "Supervisor comment submitted successfully." });

    } catch (error) {
      console.error("Error in submitSupervisorComments:", error);
      return res.status(500).json({ success: false, message: "Failed to submit comment." });
    }
  },

};

module.exports = reportController;
