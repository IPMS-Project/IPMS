const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const TokenRequest = require("../models/TokenRequest");
const emailService = require("../services/emailService");
const User = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const SALT_ROUNDS = 10;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

router.post("/request", async (req, res) => {
  try {
    const { fullName, ouEmail, password, semester, academicAdvisor, role } =
      req.body;

    if (!fullName || !ouEmail || !password || !semester) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await TokenRequest.findOne({ ouEmail });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Token request already exists for this email." });
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
      role,
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

router.post("/activate", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing." });
    const hashedToken = hashToken(token);
    console.log("Received token:", token);
    const user = await TokenRequest.findOne({ token: hashedToken });

    if (!user) return res.status(404).json({ error: "Token not found." });
    if (user.deletedAt)
      return res.status(403).json({ error: "Token has been deactivated." });
    if (user.isActivated)
      return res.status(400).json({ error: "Token already activated." });
    if (new Date() > user.expiresAt)
      return res.status(400).json({ error: "Token has expired." });

    user.isActivated = true;
    user.activatedAt = new Date();
    user.status = "activated";

    const sixMonthsLater = new Date(user.activatedAt);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    user.expiresAt = sixMonthsLater;

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
    if (user.deletedAt)
      return res.status(403).json({ error: "Token is deactivated." });
    if (!user.isActivated)
      return res.status(403).json({ error: "Token not activated." });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login api
router.post("/user-login", async (req, res) => {
  const { ouEmail, password, role } = req.body;
  console.log(role);
  if (!ouEmail || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await TokenRequest.findOne({ ouEmail });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    // First, check if the entered role matches the user's actual role
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: "User role mismatch." });
    }

    // If the role is student, do additional token checks
    if (role.toLowerCase() === "student") {
      if (!user.isStudent) {
        return res
          .status(403)
          .json({ message: "User is not registered as a student." });
      }

      if (!user.token || user.token === "") {
        return res.status(403).json({ message: "Token not issued yet." });
      }

      if (!user.isActivated) {
        return res.status(403).json({ message: "Token is not activated yet." });
      }

      const now = new Date();
      const tokenExpiry = new Date(user.expiresAt);

      if (tokenExpiry < now) {
        user.status = "deactivated";
        await user.save();
      
        return res.status(403).json({
          message: "Your account is deactivated due to token expiry.",
          renewalLink: `${FRONTEND_URL}/renew-token?email=${user.ouEmail}`
        });
      }
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
});

router.delete("/deactivate", async (req, res) => {
  try {
    const { token, ouEmail } = req.body;
    if (!token && !ouEmail) {
      return res
        .status(400)
        .json({ error: "Token or Email is required for deactivation." });
    }

    let filter = {};

    // Only hash the token if it exists
    if (token) {
      if (typeof token !== "string") {
        return res.status(400).json({ error: "Token must be a string." });
      }
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

router.post('/renew', async (req, res) => {
  const { token } = req.body;

  try {
    
    if (!token) return res.status(400).json({ error: "Token is missing." });
    console.log("Received token:", token);
    const userToken = await TokenRequest.findOne({ token: token });

    if (!userToken) {
      return res.status(404).json({ message: 'Token not found or invalid.' });
    }

    if (userToken.status !== 'activated') {
      return res.status(400).json({ message: 'Token is not activated, cannot renew.' });
    }

    // Renew the token logic (extend expiry, etc.)
    const currentDate = new Date();
    userToken.expiresAt = new Date(currentDate.setMonth(currentDate.getMonth() + 6));
    await userToken.save();

    // Send confirmation email (optional)
    await emailService.sendEmail({
      to: userToken.ouEmail,
      subject: 'Your Token Has Been Renewed',
      html: `<p>Your token has been successfully renewed and will now expire on ${userToken.expiresAt.toLocaleDateString()}.</p>`,
    });
    
    console.log('Token successfully renewed!')
    return res.status(200).json({ message: 'Token successfully renewed!' });

  } catch (error) {
    console.error('Error renewing token:', error);
    return res.status(500).json({ message: 'An error occurred while renewing the token.' });
  }
});

module.exports = router;
