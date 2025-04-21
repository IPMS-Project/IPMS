const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportController");
const InternshipRequest = require("../models/InternshipRequest");
const UserTokenRequest = require("../models/TokenRequest");

// ✅ A.1 Readonly Endpoint Based on Email
router.get("/a1readonly/:email", async (req, res) => {
    try {
      const { email } = req.params;
  
      console.log("🔍 Looking for student with email:", email);
  
      const student = await UserTokenRequest.findOne({ ouEmail: email }).select("_id fullName ouEmail");
      if (!student) {
        console.log("❌ No student found with that email");
        return res.status(404).json({ message: "Student not found" });
      }
  
      console.log("✅ Student found:", student);
  
      const form = await InternshipRequest.findOne({ student: student._id }).lean();
      if (!form) {
        console.log("❌ No A.1 form found for student:", student._id);
        return res.status(404).json({ message: "A.1 form not found for this student" });
      }
  
      console.log("✅ A.1 form found:", form);
  
      res.status(200).json({
        fullName: student.fullName,
        email: student.ouEmail,
        supervisorName: form.internshipAdvisor?.name || "",
        supervisorEmail: form.internshipAdvisor?.email || "",
        creditHours: form.creditHours || 0,
      });
    } catch (err) {
      console.error("🔥 Error fetching A.1:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });  

// ✅ Weekly Report Routes
router.post("/", controller.createReport);
router.get("/status-by-email/:email", controller.getReportStatusByEmail);
router.get("/download/:email", controller.downloadReport);

module.exports = router;