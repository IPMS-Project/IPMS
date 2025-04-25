const FourWeekReport = require("../models/fourWeekReport");

const fourWeekReportController = {
  createReport: async (req, res) => {
    try {
      const { studentId, week, tasks, lessons, challenges, supervisorComments, coordinatorComments } = req.body;

      const newReport = new FourWeekReport({
        studentId,
        week,
        tasks,
        lessons,
        challenges,
        supervisorComments,
        coordinatorComments,   // newly added
      });

      await newReport.save();

      res.status(201).json({ success: true, message: "Report submitted successfully!" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  getReports: async (req, res) => {
    try {
      const { studentId } = req.params;
      const reports = await FourWeekReport.find({ studentId }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, reports });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },
};

module.exports = fourWeekReportController;
