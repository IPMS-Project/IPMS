const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const emailService = require("../services/emailService");
const fs = require("fs");
const path = require("path");

// Mongoose model for usertokenrequests
const Request = mongoose.model("usertokenrequests", new mongoose.Schema({
  fullName: String,
  ouEmail: String,
  academicAdvisor: String,
  status: String,
  requestedAt: Date
}));

// === LOGGING FUNCTION ===
const logPath = path.join(__dirname, "../logs/coordinatorActions.log");

const logAction = (entry) => {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${entry}\n`;
  fs.appendFileSync(logPath, logLine, "utf-8");
};

// === ROUTES ===

// GET all pending requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// APPROVE request
// APPROVE request with required comment
router.post("/requests/:id/approve", async (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ message: "Approval comment is required" });

  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    await emailService.sendEmail({
      to: [request.ouEmail, request.academicAdvisor, "coordinator@ipms.edu"],
      subject: "Internship Request Approved",
      html: `<p>Hello ${request.fullName},<br>Your internship request has been <strong>approved</strong> by the coordinator.</p><p><strong>Comment:</strong> ${comment}</p>`
    });

    logAction(`[APPROVE] Request ID ${request._id} approved for ${request.ouEmail} (Comment: ${comment})`);
    res.json({ message: "Request approved and email sent." });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});

// REJECT request with required reason
router.post("/requests/:id/reject", async (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ message: "Rejection comment is required" });

  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    await emailService.sendEmail({
      to: [request.ouEmail, request.academicAdvisor, "coordinator@ipms.edu"],
      subject: "Internship Request Rejected",
      html: `<p>Hello ${request.fullName},<br>Your internship request has been <strong>rejected</strong> by the coordinator.</p><p><strong>Comment:</strong> ${comment}</p>`
    });

    logAction(`[REJECT] Request ID ${request._id} rejected for ${request.ouEmail} (Comment: ${comment})`);
    res.json({ message: "Request rejected and email sent." });
  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ message: "Rejection failed" });
  }
});


module.exports = router;
