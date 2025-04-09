const emailService = require("../services/emailService");

/**
 * Email Controller for handling email-related routes
 */
const emailController = {
  /**
   * Send an email with custom content
   * Allows users to trigger emails on demand with their own content
   */
  sendEmail: async (req, res) => {
    try {
      const { to, subject, html, text, from, attachments, cc, bcc } = req.body;

      // Validate required fields
      if (!to || !subject || !html) {
        return res.status(400).json({
          success: false,
          message:
            "Required fields missing: to, subject, and html content are required",
        });
      }

    
      const result = await emailService.sendEmail({
        to,
        subject,
        html,
        text,
        from,
        attachments,
        cc,
        bcc,
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Email sent successfully",
          messageId: result.messageId,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in sendEmail controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = emailController;

