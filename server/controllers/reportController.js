const WeeklyReport = require("../models/WeeklyReport");
const InternshipRequest = require("../models/InternshipRequest");
const UserTokenRequest = require("../models/TokenRequest");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// --- POST: Submit Weekly Report ---
const createReport = async (req, res) => {
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

    const reports = await WeeklyReport.find({ email }).sort({ week: 1 });

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
};

// --- GET: Report Status by Email (Progress Tracker) ---
const getReportStatusByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // 1. Find student by OU email
    const student = await UserTokenRequest.findOne({ ouEmail: email.toLowerCase() }).select("_id");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 2. Find A.1 form using student._id
    const a1Form = await InternshipRequest.findOne({ student: student._id });
    if (!a1Form) {
      return res.status(404).json({ success: false, message: "A.1 form not found for this student" });
    }

    // 3. Fetch submitted weekly reports
    const reports = await WeeklyReport.find({ email });
    const submittedHours = reports.reduce((sum, r) => sum + r.hours, 0);

    const creditHours = a1Form.creditHours;
    const requiredHours = creditHours * 60;

    return res.status(200).json({
      email,
      creditHours,
      requiredHours,
      submittedHours,
    });

  } catch (error) {
    console.error("Error in getReportStatusByEmail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report status.",
    });
  }
};

// --- GET: A1 Readonly Info by Student Email ---
const getA1Readonly = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("🔍 Looking for student with email:", email);

    const student = await UserTokenRequest.findOne({ ouEmail: email.toLowerCase() }).select("_id fullName ouEmail");
    if (!student) {
      console.log("❌ No student found with that email");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("✅ Student found:", student);

    const a1Form = await InternshipRequest.findOne({ student: student._id });
    if (!a1Form) {
      console.log("❌ No A.1 form found for student:", student._id);
      return res.status(404).json({ message: "A.1 form not found for this student" });
    }

    console.log("✅ A.1 form found:", a1Form);

    return res.status(200).json({
      fullName: student.fullName,
      email: student.ouEmail,
      supervisorName: a1Form.internshipAdvisor?.name || "",
      supervisorEmail: a1Form.internshipAdvisor?.email || "",
      creditHours: a1Form.creditHours || 0,
    });
  } catch (error) {
    console.error("🔥 Error in getA1Readonly:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// --- GET: Download Form A.2 PDF by Email ---
const downloadReport = async (req, res) => {
  try {
    const { email } = req.params;
    const reports = await WeeklyReport.find({ email });

    if (!reports.length) {
      return res.status(404).json({ success: false, message: "No reports found." });
    }

    const downloadsDir = path.join(__dirname, "..", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const fileName = `FormA2_${email}.pdf`;
    const filePath = path.join(downloadsDir, fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    stream.on("error", (err) => {
      console.error("PDF stream error:", err);
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
      res.download(filePath, fileName);
    });
  } catch (err) {
    console.error("Error in downloadReport:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ✅ Export all
module.exports = {
  createReport,
  getReportStatusByEmail,
  getA1Readonly,
  downloadReport,
};