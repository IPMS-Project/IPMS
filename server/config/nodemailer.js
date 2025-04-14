const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',  // If you're using Gmail
  auth: {
    user: process.env.EMAIL,      // From .env file
    pass: process.env.PASSWORD,   // App password from Gmail
  },
});

module.exports = transporter;
