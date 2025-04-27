// server/controllers/reportController.js

const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const CoordinatorReview = require("../models/CoordinatorReview");
const InternshipRequest = require("../models/InternshipRequest");
const { sendStudentProgressEmail } = require("../jobs/reminderEmail");

const reportController = {
  createReport: async (req, res) => {
    try {
      const { week, hours, tasks, lessons, name, email, supervisorName, supervisorEmail, coordinatorName, coordinatorEmail } = req.body;

      if (!week || hours === undefined || isNaN(hours) || !tasks || !lessons || !email) {
        return res.status(400).json({ success: false, message: "All required fields must be valid." });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const newReport = new WeeklyReport({
        name,
        email: normalizedEmail,
        supervisorName,
        supervisorEmail,
        coordinatorName,
        coordinatorEmail,
        week,
        hours,
        tasks,
        lessons,
        supervisorComments: "",
        coordinatorComments: "",
      });

      await newReport.save();

      const reports = await WeeklyReport.find({ email: normalizedEmail }).sort({ week: 1 });
      const completedHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);

      const internshipForm = await InternshipRequest.findOne({ "student.email": normalizedEmail });
      const requiredHours = internshipForm ? (internshipForm.creditHours || 0) * 60 : 0;
      const remainingHours = Math.max(0, requiredHours - completedHours);

      await sendStudentProgressEmail({
        name,
        email: normalizedEmail,
        completedHours,
        remainingHours,
      });

      return res.status(201).json({ success: true, message: "Weekly report submitted successfully.", reports });
    } catch (error) {
      console.error("Error in createReport:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

  getMyReports: async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ success: false, message: "Email is required." });

      const normalizedEmail = email.trim().toLowerCase();

      const reports = await WeeklyReport.find({ email: normalizedEmail }).sort({ week: 1 });
      const completedHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);

      const internshipForm = await InternshipRequest.findOne({ "student.email": normalizedEmail });
      const requiredHours = internshipForm ? (internshipForm.creditHours || 0) * 60 : 0;

      return res.status(200).json({
        success: true,
        reports,
        completedHours,
        requiredHours,
        progress: requiredHours ? Math.min(100, Math.round((completedHours / requiredHours) * 100)) : 0,
      });
    } catch (error) {
      console.error("Error in getMyReports:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch your reports." });
    }
  },

  getReportById: async (req, res) => {
    try {
      const report = await WeeklyReport.findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: "Report not found." });

      return res.status(200).json({ success: true, report });
    } catch (error) {
      console.error("Error in getReportById:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch report." });
    }
  },

  submitSupervisorComments: async (req, res) => {
    try {
      const { email, groupIndex, comments, weeks } = req.body;
      if (!comments || !weeks?.length || !email) {
        return res.status(400).json({ success: false, message: "Invalid data." });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const newReview = new SupervisorReview({ email: normalizedEmail, groupIndex, weeks, comments });
      await newReview.save();

      await WeeklyReport.updateMany({ email: normalizedEmail, week: { $in: weeks } }, { $set: { supervisorComments: comments } });

      return res.status(200).json({ success: true, message: "Supervisor comment submitted successfully." });
    } catch (error) {
      console.error("Error in submitSupervisorComments:", error);
      return res.status(500).json({ success: false, message: "Failed to submit supervisor comment." });
    }
  },

  submitCoordinatorGroupComments: async (req, res) => {
    try {
      const { email, groupIndex, comments, weeks } = req.body;
      if (!comments || !weeks?.length || !email) {
        return res.status(400).json({ success: false, message: "Invalid data." });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const firstReport = await WeeklyReport.findOne({ email: normalizedEmail, week: weeks[0] });

      const newReview = new CoordinatorReview({
        email: normalizedEmail,
        groupIndex,
        weeks,
        supervisorComments: firstReport?.supervisorComments || "",
        coordinatorComments: comments,
      });

      await newReview.save();

      await WeeklyReport.updateMany({ email: normalizedEmail, week: { $in: weeks } }, { $set: { coordinatorComments: comments } });

      return res.status(200).json({ success: true, message: "Coordinator comment submitted successfully." });
    } catch (error) {
      console.error("Error in submitCoordinatorGroupComments:", error);
      return res.status(500).json({ success: false, message: "Failed to submit coordinator comment." });
    }
  },

  getCumulativeReports: async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ success: false, message: "Email is required." });
  
      const reports = await WeeklyReport.find({ email: email.trim().toLowerCase() }).sort({ createdAt: 1 });
  
      if (!reports || reports.length === 0) {
        return res.status(200).json({ cumulativeReports: [] }); // Safe empty
      }
  
      const groupedReports = [];
      for (let i = 0; i < reports.length; i += 4) {
        groupedReports.push({
          groupIndex: i / 4,
          weeks: reports.slice(i, i + 4).map(r => r.week),
          reports: reports.slice(i, i + 4),
        });
      }
  
      return res.status(200).json({ success: true, cumulativeReports: groupedReports });
    } catch (error) {
      console.error("Error in getCumulativeReports:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
,  

  getCumulativeGroup: async (req, res) => {
    try {
      const { email, groupIndex } = req.query;
      if (!email) return res.status(400).json({ success: false, message: "Email is required." });

      const normalizedEmail = email.trim().toLowerCase();

      const reports = await WeeklyReport.find({ email: normalizedEmail }).sort({ createdAt: 1 });
      const index = parseInt(groupIndex);

      const groupedReports = [];
      for (let i = 0; i < reports.length; i += 4) {
        groupedReports.push({
          groupIndex: i / 4,
          weeks: reports.slice(i, i + 4).map(r => r.week),
          reports: reports.slice(i, i + 4),
        });
      }

      const targetGroup = groupedReports[index];
      if (!targetGroup) return res.status(404).json({ success: false, message: "Group not found." });

      return res.status(200).json({ success: true, group: targetGroup });
    } catch (error) {
      console.error("Error in getCumulativeGroup:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

  getSupervisorReviewedGroups: async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ success: false, message: "Email is required." });

      const normalizedEmail = email.trim().toLowerCase();

      const supervisorReviews = await SupervisorReview.find({ email: normalizedEmail });
      const groupsNeedingCoordinator = [];

      for (const review of supervisorReviews) {
        const { weeks } = review;
        const reports = await WeeklyReport.find({ email: normalizedEmail, week: { $in: weeks } });

        const coordinatorPending = reports.some(r => !r.coordinatorComments || r.coordinatorComments.trim() === "");

        if (coordinatorPending) {
          groupsNeedingCoordinator.push({
            groupIndex: review.groupIndex,
            weeks,
            reports,
          });
        }
      }

      return res.status(200).json({ success: true, groups: groupsNeedingCoordinator });
    } catch (error) {
      console.error("Error in getSupervisorReviewedGroups:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch supervisor-reviewed groups." });
    }
  },
};

module.exports = reportController;
