require('dotenv').config();
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Example in-memory tracking (can be replaced with MongoDB later)
let notificationLog = [];

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Email function with logging
const sendEmail = async () => {
    const timestamp = new Date().toLocaleString();

    try {
        const info = await transporter.sendMail({
            from: `"IPMS Notifications" <${process.env.EMAIL_USER}>`,
            to: "zusmin453@gmail.com", // Replace this
            subject: "IPMS Automated Email",
            text: "This is a test email sent by the IPMS cron server.",
        });

        console.log(`✅ [${timestamp}] Email sent: ${info.messageId}`);

        // Log the success
        notificationLog.push({
            time: timestamp,
            status: 'Success',
            messageId: info.messageId,
        });

    } catch (error) {
        console.error(`❌ [${timestamp}] Email failed:`, error.message);

        // Log the failure
        notificationLog.push({
            time: timestamp,
            status: 'Failed',
            error: error.message,
        });
    }
};

// Schedule the cron job to run every 2 minutes
cron.schedule('*/2 * * * *', () => {
    console.log('⏳ Cron Job Triggered at', new Date().toLocaleString());
    sendEmail();
});
