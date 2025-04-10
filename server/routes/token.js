const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const TokenRequest = require("../models/TokenRequest");
const emailService = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const SALT_ROUNDS = 10;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};


router.post("/request", async (req, res) => {
  try {
    const { fullName, ouEmail, password, semester, academicAdvisor, role } = req.body;

    if (!fullName || !ouEmail || !password || !semester) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await TokenRequest.findOne({ ouEmail });
    if (existing) {
      return res.status(400).json({ error: "Token request already exists for this email." });
    }

    const plainToken = jwt.sign({ ouEmail }, JWT_SECRET, { expiresIn: "180d" });
    const hashedToken = hashToken(plainToken);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const requestedAt = new Date();
    const expiresAt = new Date(requestedAt.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

    const request = new TokenRequest({
      fullName,
      ouEmail,
      password: hashedPassword,
      semester,
      academicAdvisor: role === "student" ? academicAdvisor : "",
      isStudent: role === "student",
      token: hashedToken,
      requestedAt,
      expiresAt,
      activationLinkSentAt: new Date(),
    });

    await request.save();

    const activationLink = `${FRONTEND_URL}/activate/${plainToken}`;
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

    res.status(201).json({
      message: "Token requested and email sent.",
      token: plainToken,
      expiresAt,
    });
  } catch (err) {
    console.error("Token Request Error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/activate/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = hashToken(token);

    const user = await TokenRequest.findOne({ token: hashedToken });

    if (!user) return res.status(404).json({ error: "Token not found." });
    if (user.deletedAt) return res.status(403).json({ error: "Token has been deactivated." });
    if (user.isActivated) return res.status(400).json({ error: "Token already activated." });
    if (new Date() > user.expiresAt) return res.status(400).json({ error: "Token has expired." });

    user.isActivated = true;
    user.activatedAt = new Date();
    user.status = "activated";

    await user.save();

    res.json({ message: "Token activated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;
    const hashedToken = hashToken(token);

    const user = await TokenRequest.findOne({ token: hashedToken });

    if (!user) return res.status(404).json({ error: "Invalid token." });
    if (user.deletedAt) return res.status(403).json({ error: "Token is deactivated." });
    if (!user.isActivated) return res.status(403).json({ error: "Token not activated." });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/deactivate", async (req, res) => {
  try {
    const { token } = req.body;
    const hashedToken = hashToken(token);

    const user = await TokenRequest.findOne({ token: hashedToken });

    if (!user) {
      return res.status(404).json({ error: "Token not found." });
    }

    if (user.deletedAt) {
      return res.status(400).json({ error: "Token already deactivated." });
    }

    user.deletedAt = new Date();
    user.status = "deleted";

    await user.save();

    res.json({ message: "Token soft-deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
