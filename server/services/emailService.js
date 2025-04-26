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
   * @param {string} [options.role] - User role (optional, to conditionally skip email)
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

      // OPTIONAL SAFEGUARD: Only allow sending if student role
      if (options.role && options.role.toLowerCase() !== "student") {
        console.log(`Email skipped: Role is ${options.role}, not student.`);
        return { success: true, message: "Email skipped for non-student." };
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
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
module.exports = emailService;
