const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Simple Email Service for the Internship Management System
 */
class EmailService {
  constructor() {
    // Create transporter using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.defaultSender =
      process.env.EMAIL_DEFAULT_SENDER ||
      "Internship Program Management System <noreply@ipms.edu>";
  }

  /**
   * Send an email with custom content
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content of the email
   * @param {string} [options.text] - Plain text version (optional)
   * @param {string} [options.from] - Sender email (defaults to system default)
   * @param {Array} [options.attachments] - Array of attachment objects
   * @param {Array} [options.cc] - Carbon copy recipients
   * @param {Array} [options.bcc] - Blind carbon copy recipients
   * @returns {Promise<Object>} - Result of the email sending operation
   */
  async sendEmail(options) {
    try {
      if (!options.to || !options.subject || !options.html) {
        return {
          success: false,
          error:
            "Missing required fields: to, subject, and html content are required",
        };
      }

      const mailOptions = {
        from: options.from || this.defaultSender,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
        attachments: options.attachments || [],
      };

      // Add optional fields if provided
      if (options.cc) mailOptions.cc = options.cc;
      if (options.bcc) mailOptions.bcc = options.bcc;

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
module.exports = emailService;

/* ========== CRON JOB FOR REMINDER EMAIL ==========  */

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

let notificationLog = [];
const logPath = path.join(__dirname, "../emailLogs.json");

const logToFile = (logData) => {
  try {
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), "utf-8");
  } catch (err) {
    console.error("⚠️ Error writing log file:", err.message);
  }
};

const scheduleReminder = () => {
  cron.schedule("*/2 * * * *", async () => {
    const timestamp = new Date().toLocaleString();
    try {
      const info = await emailService.sendEmail({
        to: process.env.EMAIL_DEFAULT_SENDER,
        subject: "IPMS Reminder Email",
        html: "<p>This is a test reminder sent from the cron job.</p>",
        text: "This is a test reminder sent from the cron job.",
      });
      console.log(`✅ [${timestamp}] Email sent: ${info.messageId}`);
      notificationLog.push({ time: timestamp, status: "Success", messageId: info.messageId });
    } catch (err) {
      console.error(`❌ [${timestamp}] Email failed:`, err.message);
      notificationLog.push({ time: timestamp, status: "Failed", error: err.message });
    }
    logToFile(notificationLog);
  });
};

scheduleReminder();
