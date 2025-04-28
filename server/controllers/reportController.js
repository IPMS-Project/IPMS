// server/controllers/reportController.js

const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const CoordinatorReview = require("../models/CoordinatorReview");
const InternshipRequest = require("../models/InternshipRequest");
const { sendStudentProgressEmail } = require("../jobs/reminderEmail");
const groupReportsByWeeks = require("../utils/groupReportsByWeeks"); // ✅ you must have a helper for this

const reportController = {
  // ------------------ Create Weekly Report ------------------
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

      await sendStudentProgressEmail({ name, email: normalizedEmail, completedHours, remainingHours });

      return res.status(201).json({ success: true, message: "Weekly report submitted successfully.", reports });
    } catch (error) {
      console.error("Error in createReport:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

  // ------------------ Get My Weekly Reports ------------------
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

  // ------------------ Get Report By ID ------------------
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

  // ------------------ Supervisor Comments ------------------
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

  // ------------------ Coordinator Comments ------------------
  // POST /api/reports/coordinator-comments
 submitCoordinatorComments :async (req, res) => {
  try {
    const { email, comments, weeks } = req.body;

    if (!email || !comments || !weeks) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Update all matching weekly reports
    const updated = await WeeklyReport.updateMany(
      { email, week: { $in: weeks } },
      { $set: { coordinatorComments: comments } }
    );

    console.log("Updated Reports:", updated);

    res.status(200).json({ message: "Coordinator comments updated successfully!" });
  } catch (error) {
    console.error("Error updating coordinator comments:", error);
    res.status(500).json({ error: "Server error updating coordinator comments" });
  }
},


  // ------------------ Get Cumulative Reports ------------------
  getCumulativeReports: async (req, res) => {
    const { email } = req.query;
  
    try {
      const reports = await WeeklyReport.find({ email });
      if (!reports.length) {
        return res.status(404).json({ message: "No reports found for this email." });
      }
  
      const groupedReports = groupReportsByWeeks(reports);
  
      const completeGroups = groupedReports.filter(group => {
        // Group must have 4 weeks
        const hasFourWeeks = group.weeks.length === 4;
        // No supervisor comments on any report
        const allReportsWithoutComments = group.reports.every(
          report => !report.supervisorComments || report.supervisorComments.trim() === ""
        );
        return hasFourWeeks && allReportsWithoutComments;
      });
  
      res.json({ cumulativeReports: completeGroups });
    } catch (error) {
      console.error("Error fetching cumulative reports:", error);
      res.status(500).json({ message: "Server error fetching cumulative reports." });
    }
  },
  
  // ------------------ Get Single Cumulative Group ------------------
  getCumulativeGroup: async (req, res) => {
    try {
      const { groupIndex } = req.params;
      const { email } = req.query;
      if (!email) return res.status(400).json({ success: false, message: "Email is required." });

      const normalizedEmail = email.trim().toLowerCase();
      const reports = await WeeklyReport.find({ email: normalizedEmail });
      if (!reports.length) {
        return res.status(404).json({ message: "No reports found for this email." });
      }

      const groupedReports = groupReportsByWeeks(reports);
      const group = groupedReports[groupIndex];
      if (!group) {
        return res.status(404).json({ message: "No group found." });
      }

      return res.json({ group });
    } catch (error) {
      console.error("Error fetching cumulative group:", error);
      return res.status(500).json({ message: "Server error fetching group." });
    }
  },

  // ------------------ Supervisor Reviewed Groups (for Coordinator Approval) ------------------
  getSupervisorReviewedGroups: async (req, res) => {
    try {
      // No need for email - Coordinator needs to review everyone's groups
      const supervisorReviews = await SupervisorReview.find();
  
      const groupsNeedingCoordinator = [];
  
      for (const review of supervisorReviews) {
        const { email, weeks, groupIndex } = review;
        const reports = await WeeklyReport.find({ email, week: { $in: weeks } });
  
        const allSupervisorReviewed = reports.every(r => r.supervisorComments && r.supervisorComments.trim() !== "");
        const anyCoordinatorMissing = reports.some(r => !r.coordinatorComments || r.coordinatorComments.trim() === "");
  
        if (allSupervisorReviewed && anyCoordinatorMissing) {
          groupsNeedingCoordinator.push({
            groupIndex,
            email,
            weeks,
            reports,
          });
        }
      }
  
      return res.status(200).json({ groups: groupsNeedingCoordinator });
    } catch (error) {
      console.error("Error in getSupervisorReviewedGroups:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch supervisor-reviewed groups." });
    }
  },
  fetchCoordinatorGroup: async (req, res) => {
    const { email, weeks } = req.body;
    try {
      const reports = await WeeklyReport.find({ email, week: { $in: weeks } });
      if (!reports.length) {
        return res.status(404).json({ message: "No reports found for this group." });
      }
      res.json({ group: { reports, weeks, email } });
    } catch (error) {
      console.error("Error fetching coordinator group:", error);
      res.status(500).json({ message: "Server error fetching coordinator group." });
    }
  },
  
  getCoordinatorReviewedGroups :async (req, res) => {
    try {
      const allReports = await WeeklyReport.find({
        supervisorComments: { $exists: true, $ne: "" }, // Supervisor reviewed
        coordinatorComments: { $in: [null, ""] }         // Coordinator not yet reviewed
      });
  
      const grouped = {}; // Group by email + 4 weeks
  
      for (const report of allReports) {
        const key = report.email;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(report);
      }
  
      const groups = [];
  
      Object.values(grouped).forEach((reports) => {
        if (reports.length >= 4) {
          groups.push({
            email: reports[0].email,
            reports: reports,
            weeks: reports.map(r => r.week),
            supervisorComment: reports[0].supervisorComments,
            groupIndex: Math.floor(Math.random() * 10000), // Generate random group index
          });
        }
      });
  
      res.json({ groups });
    } catch (error) {
      console.error("Error fetching coordinator reviewed groups:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  fetchGroupByEmailAndWeeks : async (req, res) => {
    try {
      const { email, weeks } = req.body;
  
      if (!email || !weeks || !Array.isArray(weeks)) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }
  
      const reports = await WeeklyReport.find({
        email: email,
        week: { $in: weeks },
        supervisorComments: { $exists: true, $ne: "" },
        coordinatorComments: { $in: [null, ""] }  // not yet reviewed
      }).sort({ week: 1 }); // optional: to keep them ordered
  
      if (reports.length === 0) {
        return res.status(404).json({ message: "No matching reports found" });
      }
  
      const group = {
        email,
        weeks,
        reports
      };
  
      res.status(200).json({ group });
    } catch (error) {
      console.error("Error in fetchGroupByEmailAndWeeks:", error);
      res.status(500).json({ message: "Server error fetching group", error: error.message });
    }
  },
  
};  
module.exports = reportController;
