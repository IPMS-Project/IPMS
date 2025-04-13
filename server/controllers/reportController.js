const User = require("../models/User");
const WeeklyReport = require("../models/WeeklyReport");
const Submission = require("../models/Submission");

/**
 * Report Controller – handles weekly report submissions and retrieval
 */

const reportController = {
  // POST /api/reports
  createReport: async (req, res) => {
    try {
      const { studentId, week, hours, tasks, lessons, supervisorComments } =
        req.body;

      // STEP 1: Getting students full name
      const student_name = req.body.student_name || "Anonymous"; // ideally get from user session later

      // STEP 2: Counting how many previous reports this student submitted
      const reportCount = await WeeklyReport.countDocuments({ student_name });

      // STEP 3: Calculating group number
      const groupNumber = Math.floor(reportCount / 4) + 1;

      // Basic field validation
      if (!week || hours === undefined || isNaN(hours) || !tasks || !lessons) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be valid.",
        });
      }

      // STEP 5: Saving the current weekly report
      const newReport = await new WeeklyReport({
        week,
        hours,
        tasks,
        lessons,
        supervisorComments: supervisorComments || "",
        student_name,
        groupNumber,
      }).save();

      // STEP 6: Checking if 4 reports exist in this group for this student
      const reportsInGroup = await WeeklyReport.find({
        student_name,
        groupNumber,
      });

      if (reportsInGroup.length === 4) {
        // STEP 7: Creating a new submission record for supervisor review
        const detailedReports = reportsInGroup.map((r) => ({
          week: r.week,
          hours: r.hours,
          tasks: r.tasks,
          lessons: r.lessons,
          supervisorComments: r.supervisorComments || "",
        }));
        // const summaryDetails = reportsInGroup
        //   .map(
        //     (r) =>
        //       `${r.week}: ${r.tasks} (${r.hours} hrs), Lessons: ${r.lessons}${
        //         r.supervisorComments
        //           ? `, Supervisor Comment: ${r.supervisorComments}`
        //           : ""
        //       }`
        //   )
        //   .join("\n");

        await Submission.create({
          name: student_name,
          details: detailedReports,
          supervisor_status: "pending",
        });
        console.log(
          `✅ Submission created for ${student_name} - Group ${groupNumber}`
        );
      }

      // Role-check: Only students can submit (based on their ID)
      // const user = await User.findById(studentId);
      // if (!user || user.role.toLowerCase() !== "student") {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Only students can submit reports.",
      //   });
      // }

      // Save the report
      // const newReport = new WeeklyReport({
      //   //studentId,
      //   week,
      //   hours,
      //   tasks,
      //   lessons,
      //   supervisorComments: supervisorComments || "",
      // });
      // await newReport.save();

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
