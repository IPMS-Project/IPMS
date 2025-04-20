const WeeklyReport = require("../models/WeeklyReport");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// --- Create Report ---
const createReport = async (req, res) => {
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

  // POST - Submit Weekly Report
  createReport: async (req, res) => {
    try {
      const {
        fullName,
        email,
        supervisorName,
        supervisorEmail,
        coordinatorName,
        coordinatorEmail,
        week,
        hours,
        tasks,
        lessons,
      } = req.body;
  
      if (!fullName || !email || !week || hours === undefined || isNaN(hours) || !tasks || !lessons) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be valid.",
        });
      }
  
      const newReport = new WeeklyReport({
        studentId: req.user?.id || "vikash123",
        fullName,
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
      });
  
      await newReport.save();
  
      const reports = await WeeklyReport.find({ studentId: newReport.studentId }).sort({ week: 1 });
  
      return res.status(201).json({
        success: true,
        message: "Weekly report submitted successfully.",
        reports,
      });
    } catch (error) {
      console.error("Error in createReport:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
  


  // GET - Fetch Reports for a Specific Student (Admin/Supervisor purpose)
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


  // GET - Fetch Reports for Logged-in Student (Student Purpose)
  // GET - Fetch Reports for Logged-in Student (TEMP fallback for testing)
  getMyReports: async (req, res) => {
    try {
      const studentId = req.user?.id || "vikash123"; // Static fallback
  
      // 1. Get all reports
      const reports = await WeeklyReport.find({ studentId }).sort({ week: 1 });
  
      // 2. Get all supervisor reviews for this student
      const reviews = await SupervisorReview.find({ studentId });
  
      // 3. Map weeks to comments
      const weekToComment = {};
      reviews.forEach((review) => {
        review.weeks.forEach((week) => {
          weekToComment[week] = review.comments;
        });
      });
  
      // 4. Merge supervisorComments into each report based on its week
      const enrichedReports = reports.map((r) => ({
        ...r._doc,
        supervisorComments: weekToComment[r.week] || "",
      }));
  
      return res.status(200).json({ success: true, reports: enrichedReports });
  
    } catch (error) {
      console.error("Error in getMyReports:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch your reports." });
    }
  },



  // GET - Fetch all Cumulative Reports (Unreviewed)
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

        if (isReviewed) continue;

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
  getReportById: async (req, res) => {
    try {
      const report = await WeeklyReport.findById(req.params.id);
  
      if (!report) {
        return res.status(404).json({ success: false, message: "Report not found" });
      }
  
      // ✅ Ensure supervisorComments is included
      return res.status(200).json({ success: true, report });
    } catch (error) {
      console.error("Error in getReportById:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch report" });
    }
  }
,  

  // POST - Submit Supervisor Comment
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

      // Update comments for respective weekly reports also
      await WeeklyReport.updateMany(
        { studentId: STATIC_USER_ID, week: { $in: weeks } },
        { $set: { supervisorComments: comments } }
      );

      return res.status(200).json({ success: true, message: "Supervisor comment submitted successfully." });

    } catch (error) {
      console.error("Error in submitSupervisorComments:", error);
      return res.status(500).json({ success: false, message: "Failed to submit comment." });
    }
  },

};

// --- Get Reports By Sooner ID ---
const getReportsByStudent = async (req, res) => {
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
};

// --- Get Report Status ---
const getReportStatus = async (req, res) => {
  try {
    const { soonerId } = req.params;

    const reports = await WeeklyReport.find({ soonerId });
    const submittedHours = reports.reduce((sum, report) => sum + report.hours, 0);

    // Static assumption: 3 credits → 180 hours
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
};

// --- Generate PDF Download ---
const downloadReport = async (req, res) => {
  try {
    const { soonerId } = req.params;
    const reports = await WeeklyReport.find({ soonerId });

    if (!reports.length) {
      return res.status(404).json({ success: false, message: "No reports found." });
    }

    // ✅ Ensure the /downloads directory exists
    const downloadsDir = path.join(__dirname, "..", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
      console.log("✅ Created downloads directory:", downloadsDir);
    }

    const fileName = `FormA2_${soonerId}.pdf`;
    const filePath = path.join(downloadsDir, fileName);

    // ✅ Setup the PDF and stream
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);

    // Catch stream errors explicitly
    stream.on("error", (err) => {
      console.error("❌ Write stream error:", err);
      res.status(500).json({ success: false, message: "PDF write failed." });
    });

    doc.pipe(stream);

    doc.fontSize(20).text("SMART Form A.2 – Weekly Progress Report", { align: "center" });
    doc.moveDown();

    reports.forEach((report) => {
      doc.fontSize(12).text(`Week: ${report.week}`);
      doc.text(`Hours: ${report.hours}`);
      doc.text(`Tasks: ${report.tasks}`);
      doc.text(`Lessons Learned: ${report.lessons}`);
      doc.text(`Supervisor Comments: ${report.supervisorComments || "N/A"}`);
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => {
      console.log("✅ PDF successfully written to:", filePath);
      res.download(filePath, fileName);
    });

  } catch (err) {
    console.error("🔥 Error in downloadReport:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


// ✅ Export all functions
module.exports = {
  createReport,
  getReportsByStudent,
  getReportStatus,
  downloadReport,
};
