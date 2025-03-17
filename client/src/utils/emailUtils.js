/**
 * Utility functions for sending emails through the API
 */

// Define the API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Send an email with custom content
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email(s)
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content of the email
 * @param {string} [emailData.text] - Plain text version (optional)
 * @param {string} [emailData.from] - Sender email (defaults to system default)
 * @param {Array} [emailData.attachments] - Array of attachment objects
 * @param {Array} [emailData.cc] - Carbon copy recipients
 * @param {Array} [emailData.bcc] - Blind carbon copy recipients
 * @returns {Promise<Object>} - API response
 */
export const sendEmail = async (emailData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};
