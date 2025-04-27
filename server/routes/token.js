const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const TokenRequest = require("../models/TokenRequest");
const emailService = require("../services/emailService");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const SALT_ROUNDS = 10;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ---------------------------------- TOKEN REQUEST ----------------------------------
// ---------------------------------- TOKEN REQUEST ----------------------------------
router.post("/request", async (req, res) => {
  try {
    const { fullName, ouEmail, soonerId, password, semester, academicAdvisor, role } = req.body;

    if (!fullName || !ouEmail || !password || !semester || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await TokenRequest.findOne({ ouEmail });
    if (existing) {
      return res.status(401).json({ error: "Token request already exists for this email." });
    }

    if (role.toLowerCase() === "student") {
      if (!soonerId) {
        return res.status(400).json({ error: "Sooner ID is required for students." });
      }

      const existingSoonerId = await TokenRequest.findOne({ soonerId });
      if (existingSoonerId) {
        return res.status(402).json({ error: "Token request already exists for this Sooner ID." });
      }
    }

    let plainToken = null;
    let hashedToken = null;

    if (role.toLowerCase() === "student") {
      plainToken = jwt.sign({ ouEmail }, JWT_SECRET, { expiresIn: "180d" });
      hashedToken = hashToken(plainToken);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const request = new TokenRequest({
      fullName,
      ouEmail,
      soonerId: role.toLowerCase() === "student" ? soonerId : undefined,
      password: hashedPassword,
      semester,
      role,
      academicAdvisor: role.toLowerCase() === "student" ? academicAdvisor : undefined,
      isStudent: role.toLowerCase() === "student",
      token: hashedToken,
      activationLinkSentAt: role.toLowerCase() === "student" ? new Date() : undefined,
    });

    await request.save();

    if (role.toLowerCase() === "student") {
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
      });
    } else {
      console.log(`Email not sent - user is not a student: ${ouEmail}`);
      res.status(201).json({ message: "Token is not required for supervisors or coordinators." });
    }
  } catch (err) {
    console.error("Token Request Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------- ACTIVATE TOKEN ----------------------------------
router.post("/activate", async (req, res) => {
  try {
    console.log(" Activation request received at backend");

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing." });

    const hashedToken = hashToken(token);
    const user = await TokenRequest.findOne({ token: hashedToken });

    if (!user) return res.status(404).json({ error: "Token not found." });
    if (user.deletedAt) return res.status(403).json({ error: "Token has been deactivated." });
    if (user.isActivated) return res.status(400).json({ error: "Token already activated." });
    if (new Date() > user.expiresAt) return res.status(400).json({ error: "Token has expired." });

    user.isActivated = true;
    user.activatedAt = new Date();
    user.status = "activated";

    const sixMonthsLater = new Date(user.activatedAt);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    user.expiresAt = sixMonthsLater;

    await user.save();
    console.log("Token activated successfully");

    res.json({ message: "Token activated successfully." });
  } catch (err) {
    console.error("Activation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------- LOGIN BY TOKEN (Optional) ----------------------------------
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

// ---------------------------------- USER LOGIN (Email/Password) ----------------------------------
router.post("/user-login", async (req, res) => {
  const { ouEmail, password, role } = req.body;

  if (!ouEmail || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await TokenRequest.findOne({ ouEmail });

    if (!user) {
      return res.status(401).json({ message: "Email does not Exist. Try Signing up." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: "User role mismatch." });
    }

    if (role.toLowerCase() === "student") {
      if (!user.isStudent) {
        return res.status(403).json({ message: "User is not registered as a student." });
      }

      if (!user.token || user.token === "") {
        return res.status(403).json({ message: "Token not issued yet." });
      }

      if (!user.isActivated) {
        return res.status(403).json({ message: "Token is not activated yet." });
      }

      const now = new Date();
      const tokenExpiry = new Date(user.expiresAt);

      if (tokenExpiry < now || user.status === "deactivated") {
        if (user.status !== "deactivated") {
          user.status = "deactivated";
          await user.save();
        }
        return res.status(403).json({
          message: "Your account is deactivated due to token expiry.",
          renewalLink: `${FRONTEND_URL}/renew-token/${user.token}`,
        });
      }
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const { ouEmail } = req.body;

    if (!ouEmail) {
      return res.status(400).json({ error: "Email is not found for deletion." });
    }
    
    const user = await TokenRequest.findOneAndDelete({ouEmail});
    
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------- DEACTIVATE TOKEN (SOFT DELETE) ----------------------------------
router.delete("/deactivate", async (req, res) => {
  try {
    const { token, ouEmail } = req.body;
    if (!token && !ouEmail) {
      return res.status(400).json({ error: "Token or Email is required for deactivation." });
    }

    let filter = {};

    if (token) {
      const hashedToken = hashToken(token);
      filter = { token: hashedToken };
    } else {
      filter = { ouEmail };
    }

    const user = await TokenRequest.findOne(filter);
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

// ---------------------------------- TOKEN RENEWAL ----------------------------------
// ---------------------------------- TOKEN RENEWAL ----------------------------------
router.post("/renew", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    // const hashedToken = hashToken(token);
    const user = await TokenRequest.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "Token not found." });
    }

    if (user.deletedAt || user.status === "deleted") {
      return res.status(403).json({ message: "Token has been deleted." });
    }

    const newToken = jwt.sign({ ouEmail: user.ouEmail }, JWT_SECRET, { expiresIn: "180d" });
    const hashedNewToken = hashToken(newToken);

    const newExpiresAt = new Date();
    newExpiresAt.setMonth(newExpiresAt.getMonth() + 6);

    user.token = hashedNewToken;
    user.expiresAt = newExpiresAt;
    user.status = "activated";

    await user.save();

    res.status(200).json({
      message: "Your token has been updated. You can now securely login.",
      redirectUrl: `${FRONTEND_URL}/renewal-success`,
      token: newToken,
      expiresAt: newExpiresAt,
    });
  } catch (error) {
    console.error("Token renewal error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;