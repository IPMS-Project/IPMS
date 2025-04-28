const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const CoordinatorReview = require("../models/CoordinatorReview");
const InternshipRequest = require("../models/InternshipRequest");
const { sendStudentProgressEmail } = require("../jobs/reminderEmail");

const STATIC_USER_ID = "vikash123";

// Calculating completed and required hours for student
async function getStudentHours(email) {
  const emailLower = email.toLowerCase();

  // Getting all weekly reports by student email
  const reports = await WeeklyReport.find({
    email: { $regex: new RegExp(`^${emailLower}$`, "i") }, // i = case-insensitive
  });

  const completedHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);

  // Finding Internship Request (A1) for required hours
  const internshipForm = await InternshipRequest.findOne({
    "student.email": { $regex: new RegExp(`^${email}$`, "i") },
  });

  const requiredHours = internshipForm
    ? (internshipForm.creditHours || 0) * 60
    : 0;
  return { completedHours, requiredHours };
}
const reportController = {
  createReport: async (req, res) => {
    try {
      const {
        week,
        hours,
        tasks,
        lessons,
        name,
        email,
        supervisorName,
        supervisorEmail,
        coordinatorName,
        coordinatorEmail,
      } = req.body;

      if (!week || hours === undefined || isNaN(hours) || !tasks || !lessons) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be valid.",
        });
      }

      const newReport = new WeeklyReport({
        studentId: STATIC_USER_ID,
        name,
        email,
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

      const reports = await WeeklyReport.find({ email }).sort({ week: 1 });
      const { completedHours, requiredHours } = await getStudentHours(email); // Getting completed and required hours of the student

      await sendStudentProgressEmail({
        name,
        email,
        completedHours,
        remainingHours: requiredHours - completedHours,
      });

      return res.status(201).json({
        success: true,
        message: "Weekly report submitted successfully.",
        reports,
      });
    } catch (error) {
      console.error("Error in createReport:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },

  getReportsByStudent: async (req, res) => {
    try {
      const { userId } = req.params;
      const reports = await WeeklyReport.find({ studentId: userId }).sort({
        week: 1,
      });

      return res.status(200).json({ success: true, reports });
    } catch (error) {
      console.error("Error in getReportsByStudent:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch reports." });
    }
  },

  getMyReports: async (req, res) => {
    try {
      const studentId = req.user?.id || STATIC_USER_ID;
      const reports = await WeeklyReport.find({ studentId }).sort({ week: 1 });

      const reviews = await SupervisorReview.find({ studentId });

      const weekToComment = {};
      reviews.forEach((review) => {
        review.weeks.forEach((week) => {
          weekToComment[week] = review.comments;
        });
      });

      const enrichedReports = reports.map((r) => ({
        ...r._doc,
        supervisorComments: weekToComment[r.week] || "",
      }));

      return res.status(200).json({ success: true, reports: enrichedReports });
    } catch (error) {
      console.error("Error in getMyReports:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch your reports." });
    }
  },

  getCumulativeReports: async (req, res) => {
    try {
      const reports = await WeeklyReport.find({
        studentId: STATIC_USER_ID,
      }).sort({ createdAt: 1 });

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

        if (isReviewed) continue;

        groupedReports.push({
          groupIndex,
          weeks: reports.slice(i, i + 4).map((r) => r.week),
          reports: reports.slice(i, i + 4),
        });
      }

      return res
        .status(200)
        .json({ success: true, cumulativeReports: groupedReports });
    } catch (error) {
      console.error("Error in getCumulativeReports:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },

  getCumulativeGroup: async (req, res) => {
    try {
      const { groupIndex } = req.params;
      const index = parseInt(groupIndex);

      const reports = await WeeklyReport.find({
        studentId: STATIC_USER_ID,
      }).sort({ createdAt: 1 });

      if (!reports.length) {
        return res
          .status(404)
          .json({ success: false, message: "No reports found." });
      }

      const groupedReports = [];
      for (let i = 0; i < reports.length; i += 4) {
        groupedReports.push({
          groupIndex: i / 4,
          weeks: reports.slice(i, i + 4).map((r) => r.week),
          reports: reports.slice(i, i + 4),
        });
      }

      const targetGroup = groupedReports[index];
      if (!targetGroup) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found." });
      }

      return res.status(200).json({ success: true, group: targetGroup });
    } catch (error) {
      console.error("Error in getCumulativeGroup:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },

  getReportById: async (req, res) => {
    try {
      const report = await WeeklyReport.findById(req.params.id);
      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      }

      return res.status(200).json({ success: true, report });
    } catch (error) {
      console.error("Error in getReportById:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch report" });
    }
  },

  submitSupervisorComments: async (req, res) => {
    try {
      const { groupIndex, comments, weeks } = req.body;

      if (!comments || !weeks || weeks.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid comment data." });
      }

      const newReview = new SupervisorReview({
        studentId: STATIC_USER_ID,
        groupIndex,
        weeks,
        comments,
      });

      await newReview.save();

      await WeeklyReport.updateMany(
        { studentId: STATIC_USER_ID, week: { $in: weeks } },
        { $set: { supervisorComments: comments } }
      );

      return res.status(200).json({
        success: true,
        message: "Supervisor comment submitted successfully.",
      });
    } catch (error) {
      console.error("Error in submitSupervisorComments:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to submit comment." });
    }
  },

  getSupervisorReviewedGroups: async (req, res) => {
    try {
      const supervisorReviews = await SupervisorReview.find({
        studentId: STATIC_USER_ID,
      });

      const reviewedGroups = [];

      for (const review of supervisorReviews) {
        const reports = await WeeklyReport.find({
          studentId: STATIC_USER_ID,
          week: { $in: review.weeks },
        });

        const allCoordinatorCommentsPresent = reports.every(
          (r) => r.coordinatorComments && r.coordinatorComments.trim() !== ""
        );

        if (allCoordinatorCommentsPresent) continue;

        reviewedGroups.push({
          groupIndex: review.groupIndex,
          weeks: review.weeks,
          reports,
        });
      }

      return res.status(200).json({ success: true, groups: reviewedGroups });
    } catch (error) {
      console.error("Error in getSupervisorReviewedGroups:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch supervisor-reviewed groups.",
      });
    }
  },

  submitCoordinatorGroupComments: async (req, res) => {
    try {
      const { groupIndex, comments, weeks } = req.body;

      if (!comments || !weeks || weeks.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid comment data." });
      }

      const firstWeek = weeks[0];
      const firstReport = await WeeklyReport.findOne({
        studentId: STATIC_USER_ID,
        week: firstWeek,
      });

      const newReview = new CoordinatorReview({
        studentId: STATIC_USER_ID,
        groupIndex,
        weeks,
        supervisorComments: firstReport?.supervisorComments || "",
        coordinatorComments: comments,
      });

      await newReview.save();

      await WeeklyReport.updateMany(
        { studentId: STATIC_USER_ID, week: { $in: weeks } },
        { $set: { coordinatorComments: comments } }
      );

      return res.status(200).json({
        success: true,
        message: "Coordinator comment submitted successfully.",
      });
    } catch (error) {
      console.error("Error in submitCoordinatorGroupComments:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to submit comment." });
    }
  },

  // Checking if student is eligible for A3 (Final Evaluation)
  getStudentProgress: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Student email is required." });
      }

      // Finding Internship Request (A1) for required hours
      const internshipForm = await InternshipRequest.findOne({
        "student.email": { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!internshipForm) {
        return res
          .status(404)
          .json({ success: false, message: "Internship (A1) form not found." });
      }

      const { completedHours, requiredHours } = await getStudentHours(
        email.toLowerCase()
      );

      // Determining A3 form access eligibility for the student
      const eligibleForA3 =
        completedHours >= requiredHours && requiredHours > 0;

      return res.json({
        success: true,
        completedHours,
        requiredHours,
        eligibleForA3,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },
};

module.exports = reportController;
