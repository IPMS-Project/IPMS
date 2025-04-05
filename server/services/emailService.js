const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
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
  }

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
      console.log("Email sent successfully:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  }
}

const emailService = new EmailService();
module.exports = emailService;
