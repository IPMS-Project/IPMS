const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const User = require("../models/User");
const TokenRequest = require("../models/TokenRequest");

// GET internship request by student's ouEmail
router.post("/", async (req, res) => {
  const { ouEmail } = req.body;
  console.log("Received email:", ouEmail);

  try {
    const internshipData = await InternshipRequest.findOne({
      "student.email": ouEmail,
    });
    

    if (!internshipData) {
      // No record found, return a specific flag
      return res.status(200).json({
        message: "No internship request found",
        approvalStatus: "not_submitted",
      });
    }
    const { supervisor_status, coordinator_status } = internshipData;


    const approvalStatus =
      (supervisor_status == "pending" || supervisor_status == "approved" ) ? supervisor_status : coordinator_status
    
    console.log(supervisor_status, coordinator_status)

    return res.status(200).json({ message: "Success", approvalStatus });
  } catch (error) {
    console.error("Error fetching internship request:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Fetch interneeName, soonerId, interneeEmail by OU email passed as query string
router.get("/me", async (req, res) => {
  const { ouEmail } = req.query;
  if (!ouEmail) {
    return res
      .status(400)
      .json({ message: "Missing query parameter: ouEmail" });
  }

  try {
    // look in the TokenRequest collection where your student doc lives
    const student = await TokenRequest.findOne({ ouEmail }).select(
      "fullName soonerId ouEmail"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({
      interneeName: student.fullName,
      soonerId: student.soonerId,
      interneeEmail: student.ouEmail,
    });
  } catch (err) {
    console.error("Error in GET /api/student/me:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/student/account/:id
router.delete("/account/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    await TokenRequest.findByIdAndDelete(studentId);

    await InternshipRequest.deleteMany({ student: studentId });

    return res
      .status(200)
      .json({ message: "Account and related data deleted" });
  } catch (err) {
    console.error("Error deleting account:", err);
    return res
      .status(500)
      .json({ message: "Server error while deleting account" });
  }
});

module.exports = router;
