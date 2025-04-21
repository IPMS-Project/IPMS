const WeeklyReport = require("../models/WeeklyReport");
const SupervisorReview = require("../models/SupervisorReview");
const InternshipRequest = require("../models/InternshipRequest");
const CronJobModel = require("../models/CronJob");
const { registerAllJobs } = require("../jobs/registerCronJobs");

const STATIC_USER_ID = "vikash123";

const reportController = {
  // POST - Submit Weekly Report
  createReport: async (req, res) => {
    try {
      const { email, week, hours, tasks, lessons } = req.body;

      if (
        !email ||
        !week ||
        hours === undefined ||
        isNaN(hours) ||
        !tasks ||
        !lessons
      ) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be valid.",
        });
      }

      // Create new report
      const newReport = new WeeklyReport({
        studentId: STATIC_USER_ID,
        email,
        week,
        hours,
        tasks,
        lessons,
        supervisorComments: "", // Supervisor will update later
      });

      await newReport.save();

      // Find and increment completedHours in the InternshipRequest for matching student email
      const internship = await InternshipRequest.findOne({}) // dummy to populate
        .populate({
          path: "student",
          match: { ouEmail: email },
          select: "_id ouEmail", // only bring what we need
        });

      if (internship && internship.student) {
        // Increment the completed hours
        const updated = await InternshipRequest.findByIdAndUpdate(
          internship._id,
          { $inc: { completedHours: hours } },
          { new: true }
        );

        // ✅ Log remaining hours (for testing)
        const required = updated.requiredHours;
        const completed = updated.completedHours;
        const remaining = required - completed;
        console.log(
          `Remaining internship hours for ${email}: ${remaining} hours`
        );

        //  Registering cronjob
        const cronName = "internshipHourReminder";
        const existingCron = await CronJobModel.findOne({ name: cronName });

        if (!existingCron) {
          await CronJobModel.create({
            name: cronName,
            jobName: "internshipHourReminder",
            schedule: "*/1 * * * *", // Every minute for testing
            isActive: true,
            options: {
              timezone: "Asia/Kolkata",
            },
          });

          console.log(`✅ Cron job registered for ${email}`);

          await registerAllJobs();
        }
      } else {
        console.warn(`No internship request found for student email: ${email}`);
      }

      // After saving, return updated reports to client
      const reports = await WeeklyReport.find({
        studentId: STATIC_USER_ID,
      }).sort({ week: 1 });

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
  // GET - Fetch Reports for a Specific Student (Admin/Supervisor purpose)
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

  // GET - Fetch Reports for Logged-in Student (Student Purpose)
  // GET - Fetch Reports for Logged-in Student (TEMP fallback for testing)
  getMyReports: async (req, res) => {
    try {
      const studentId = req.user?.id || "vikash123"; // Static fallback

      // Get all reports
      const reports = await WeeklyReport.find({ studentId }).sort({ week: 1 });

      // Get all supervisor reviews for this student
      const reviews = await SupervisorReview.find({ studentId });

      //  Map weeks to comments
      const weekToComment = {};
      reviews.forEach((review) => {
        review.weeks.forEach((week) => {
          weekToComment[week] = review.comments;
        });
      });

      // Merge supervisorComments into each report based on its week
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

  // GET - Fetch all Cumulative Reports (Unreviewed)
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

  // GET - Fetch a Specific Group by groupIndex
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

      // Ensure supervisorComments is included
      return res.status(200).json({ success: true, report });
    } catch (error) {
      console.error("Error in getReportById:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch report" });
    }
  },
  // POST - Submit Supervisor Comment
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

      // Update comments for respective weekly reports also
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
};

module.exports = reportController;
