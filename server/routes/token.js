const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const TokenRequest = require("../models/TokenRequest");
const emailService = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;


router.post("/request", async (req, res) => {
  try {
    const { fullName, ouEmail, password, semester, academicAdvisor } = req.body;

    if (!fullName || !ouEmail || !password || !semester || !academicAdvisor) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const token = jwt.sign({ ouEmail }, JWT_SECRET, { expiresIn: "180d" });

    const request = new TokenRequest({
      fullName,
      ouEmail,
      password,
      semester,
      academicAdvisor,
      token,
    });

    await request.save();

    const activationLink = `${FRONTEND_URL}/activate/${token}`;

    const emailBody = `
      <p>Hi ${fullName},</p>
      <p>Thank you for requesting access to the Internship Program Management System (IPMS).</p>
      <p><strong>Your activation link:</strong></p>
      <p><a href="${activationLink}">${activationLink}</a></p>
      <p><strong>Note:</strong> This token will expire in <strong>5 days</strong> if not activated.</p>
      <p>Regards,<br/>IPMS Team</p>
    `;

    await emailService.sendEmail({
      to: ouEmail,
      subject: "Your IPMS Token Activation Link",
      html: emailBody,
    });

    res.status(201).json({ message: "Token requested and email sent." });
  } catch (err) {
    console.error("Token Request Error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/activate/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await TokenRequest.findOne({ token });

    if (!user) return res.status(404).json({ error: "Token not found." });
    if (user.isActivated) return res.status(400).json({ error: "Token already activated." });

    user.isActivated = true;
    user.activatedAt = new Date();
    user.status = "Activated";

    await user.save();

    res.json({ message: "Token activated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await TokenRequest.findOne({ token });

    if (!user) return res.status(404).json({ error: "Invalid token." });
    if (!user.isActivated) return res.status(403).json({ error: "Token not activated." });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/deactivate", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await TokenRequest.findOneAndDelete({ token });

    if (!user) {
      return res.status(404).json({ error: "Token not found." });
    }

    res.json({ message: "Token deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

