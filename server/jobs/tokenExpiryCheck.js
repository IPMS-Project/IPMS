const mongoose = require("mongoose");
const UserTokenRequest = require("../models/TokenRequest"); // Adjust the path if needed
const emailService = require("../services/emailService");
require("dotenv").config();

const checkAndSendReminders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const now = new Date();

    // Tokens expiring in 3 and 7 days
    const daysToCheck = [3, 7];

    for (const days of daysToCheck) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + days);

      const expiringTokens = await UserTokenRequest.find({
        isActivated: true,
        status: "activated",
        expiresAt: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      });

      for (const token of expiringTokens) {
        const subject = `Reminder: Your Internship Token Expires in ${days} Day${days > 1 ? "s" : ""}`;
        const renewalLink = `${process.env.FRONTEND_URL}/renew-token/${token.token}`; // Update with actual renewal path

        const html = `
          <p>Hello ${token.fullName},</p>
          <p>This is a reminder that your internship access token will expire in <strong>${days} day${days > 1 ? "s" : ""}</strong> on <strong>${token.expiresAt.toDateString()}</strong>.</p>
          <p>If your token expires, you will lose access to the internship management system.</p>
          <p><a href="${renewalLink}">Click here to renew your token securely</a>.</p>
          <p>Thank you,<br/>Internship Program Management Team</p>
        `;

        const emailResponse = await emailService.sendEmail({
          to: token.ouEmail,
          subject,
          html,
        });

        console.log(`Email sent to ${token.ouEmail} for ${days}-day reminder:`, emailResponse);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error during token expiry check:", error);
  }
}

module.exports = {
    checkAndSendReminders,
};
