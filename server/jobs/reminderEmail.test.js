const emailService = require("../services/emailService");
const coordinatorReminder = require('./reminderEmail');

jest.mock("../services/emailService");

describe("reminderEmail", () => {
    beforeEach( () => {
        emailService.sendEmail.mockClear();
    });

    it("coordinatorReminder sends email", async () => {
        await coordinatorReminder();
        // Check sendEmail was called
        expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
        expect(emailService.sendEmail).toHaveBeenCalledWith({to: process.env.EMAIL_DEFAULT_SENDER,
            subject: "Reminder: Coordinator Approval Pending",
            html: "<p>This is a cron-based reminder email from IPMS.</p>",
            text: "Reminder: Coordinator Approval Pending",})
    });
})