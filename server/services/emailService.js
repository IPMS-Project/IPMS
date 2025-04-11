const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
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
      process.env.EMAIL_DEFAULT_SENDER || "IPMS <noreply@ipms.edu>";

    // Define the path for the email log file
    this.logPath = path.join(__dirname, "../logs/emailLogs.json");
  }

  // Append email result to log file
  appendToLog(entry) {
    let logData = [];
    try {
      if (fs.existsSync(this.logPath)) {
        const existing = fs.readFileSync(this.logPath, "utf8");
        logData = JSON.parse(existing || "[]");
      }
    } catch (err) {
      console.error("⚠️ Failed to read email log:", err.message);
    }

    logData.push(entry);
    try {
      fs.writeFileSync(this.logPath, JSON.stringify(logData, null, 2), "utf-8");
    } catch (err) {
      console.error("⚠️ Failed to write to email log:", err.message);
    }
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
          error: "Missing required fields: to, subject, and html content",
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

      if (options.cc) mailOptions.cc = options.cc;
      if (options.bcc) mailOptions.bcc = options.bcc;

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);

      this.appendToLog({
        time: new Date().toISOString(),
        status: "Success",
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending email:", error);

      this.appendToLog({
        time: new Date().toISOString(),
        status: "Failed",
        to: options.to,
        subject: options.subject,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
module.exports = emailService;
