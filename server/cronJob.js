require('dotenv').config();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let notificationLog = [];

const logPath = path.join(__dirname, 'emailLogs.json');

// Write log to file
const logToFile = (logData) => {
    try {
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf-8');
    } catch (err) {
        console.error('⚠️ Error writing to log file:', err.message);
    }
};

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Email sending function
const sendEmail = async () => {
    const timestamp = new Date().toLocaleString();

    try {
        const info = await transporter.sendMail({
            from: `"IPMS Notifications" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: "IPMS Automated Email",
            text: "This is a test email sent by the IPMS cron server.",
        });

        console.log(`✅ [${timestamp}] Email sent: ${info.messageId}`);

        notificationLog.push({
            time: timestamp,
            status: 'Success',
            messageId: info.messageId,
        });

    } catch (error) {
        console.error(`❌ [${timestamp}] Email failed:`, error.message);

        notificationLog.push({
            time: timestamp,
            status: 'Failed',
            error: error.message,
        });
    }

    logToFile(notificationLog);
};

/*Run cron job every 2 minutes */
cron.schedule('*/2 * * * *', () => {
    console.log('⏳ Cron Job Triggered at', new Date().toLocaleString());
    sendEmail();
});
