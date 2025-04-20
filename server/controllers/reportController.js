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
