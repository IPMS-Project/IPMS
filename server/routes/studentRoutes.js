const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/internshiprequest");
const User = require("../models/User");
const TokenRequest = require("../models/TokenRequest");


// GET internship request by student's ouEmail
router.post("/", async (req, res) => {
  const { ouEmail } = req.body;
  console.log("Received email:", ouEmail);

  try {
    const studentUser = await TokenRequest.findOne({ ouEmail });

    if (!studentUser) {
      return res.status(404).json({ message: "Student not found in TokenRequest" });
    }

    const internshipData = await InternshipRequest.findOne({ student: studentUser._id });

    if (!internshipData) {
      // No record found, return a specific flag
      return res.status(200).json({ message: "No internship request found", approvalStatus: "not_submitted" });
    }

    const approvalStatus = internshipData.status;

    return res.status(200).json({ message: "Success", approvalStatus });
  } catch (error) {
    console.error("Error fetching internship request:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

  

module.exports = router;