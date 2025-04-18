const express = require("express");
const router = express.Router();
const InternshipRequest = require("../models/InternshipRequest");
const User = require("../models/User");

// GET internship request by student's ouEmail
router.post("/", async (req, res) => {
    const { ouEmail } = req.body;
  console.log(ouEmail)
    try {
      const studentUser = await User.findOne({ email: ouEmail });
      if (!studentUser) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const internshipData = await InternshipRequest.findOne({ student: studentUser._id });
  
      if (!internshipData) {
        return res.status(404).json({ message: "No internship request found for this student" });
      }
      const approvalStatus = internshipData.status == "approved" ? true : false
      return res.status(200).json({ message: "Success" , approvalStatus });
    } catch (error) {
      console.error("Error fetching internship request:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;