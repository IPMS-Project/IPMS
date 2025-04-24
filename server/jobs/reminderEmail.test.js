const emailService = require("../services/emailService");
const { coordinatorReminder, supervisorReminder } = require('./reminderEmail');
const mockingoose = require("mockingoose");
const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const NotificationLog = require("../models/NotifLog");
const UserTokenRequest = require("../models/TokenRequest");
const mongoose = require("mongoose");

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

// Supervisor reminder test

describe("supervisorReminder", () => {
    beforeEach(() => {
	mockingoose.resetAll();
	jest.clearAllMocks();
    });

    it("should send a reminder to the supervisor", async () => {

	const submissionId = new mongoose.Types.ObjectId();
	const studentId = new mongoose.Types.ObjectId();
	const studentMail = "student@example.com"
	const supervisorId = new mongoose.Types.ObjectId();
	const supervisorMail = "supervisor@example.com"
	
        const fakeInternshipRequest = {
            _id: submissionId,
            student_id: studentId,
            supervisor_id: supervisorId,
            supervisor_status: "pending",
            supervisor_reminder_count: 0,
            last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            topic: "AI Research",
            description: "Exploring generative AI models",
            status: "submitted",
            endDate: new Date("2025-04-28T00:00:00Z"),
            startDate: new Date("2025-04-01T00:00:00Z"),
            creditHours: 3,
            internshipAdvisor: {
                email: "advisor.mail@ou.edu"
            },
            workplace: {
                name: "Workplace name"
            },
            student: studentId,
            save: jest.fn(),
        }
        
	// Mocking the InternshipRequest model
	mockingoose(InternshipRequest).toReturn([fakeInternshipRequest], "find");
        mockingoose(WeeklyReport).toReturn([], "find");
        mockingoose(Evaluation).toReturn([], "find");
        jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
            { _id: supervisorId, ouEmail: supervisorMail, role: "supervisor", isActivated: true }
        ]);
	jest.spyOn(UserTokenRequest, "findById").mockImplementation((id) => {
	    if (id.equals(studentId)) {
		return Promise.resolve({ _id: studentId, ouEmail: studentMail });
	    }
	    if (id.equals(supervisorId)) {
		return Promise.resolve({ _id: supervisorId, ouEmail: supervisorMail });
	    }
	    return Promise.resolve(null);
	});
	mockingoose(NotificationLog).toReturn({}, "save");
	jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

	// Function to be tested
	await supervisorReminder();

	// Expectations
	expect(emailService.sendEmail).toHaveBeenCalledWith(
	    expect.objectContaining({
		to: expect.any(String),
		subject: expect.stringContaining("Reminder")
	    })
	);
	
	expect(InternshipRequest.prototype.save).toHaveBeenCalled();
    });
});

describe("supervisorReminder escalation", () => {
    beforeEach(() => {
	mockingoose.resetAll();
	jest.clearAllMocks();
	jest.restoreAllMocks();
    });

    it("should return to the student after multiple reminders", async () => {
	const submissionId = new mongoose.Types.ObjectId();
	const studentId = new mongoose.Types.ObjectId();
	const studentMail = "student@example.com"
	const supervisorId = new mongoose.Types.ObjectId();
	const supervisorMail = "supervisor@example.com"

	const fakeInternshipRequestData = {
            _id: submissionId,
            student_id: studentId,
            supervisor_id: supervisorId,
            supervisor_status: "pending",
            supervisor_reminder_count: 2,
            last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            topic: "AI Research",
            description: "Exploring generative AI models",
            status: "submitted",
            endDate: new Date("2025-04-28T00:00:00Z"),
            startDate: new Date("2025-04-01T00:00:00Z"),
            creditHours: 3,
            internshipAdvisor: {
                email: "advisor.mail@ou.edu"
            },
            workplace: {
                name: "Workplace name"
            },
            student: studentId,
            save: jest.fn(),
        }

	mockingoose(InternshipRequest).toReturn([fakeInternshipRequestData], "find");
        mockingoose(WeeklyReport).toReturn([], "find");
        mockingoose(Evaluation).toReturn([], "find");
        jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
            { _id: supervisorId, ouEmail: supervisorMail, role: "supervisor", isActivated: true }
        ]);
	jest.spyOn(UserTokenRequest, "findById").mockImplementation((id) => {
	    if (id.equals(studentId)) {
		return Promise.resolve({ _id: studentId, ouEmail: studentMail });
	    }
	    if (id.equals(supervisorId)) {
		return Promise.resolve({ _id: supervisorId, ouEmail: supervisorMail });
	    }
	    return Promise.resolve(null);
	});

	const saveSpy = jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);
	const notifLogSpy = jest.spyOn(NotificationLog, "create").mockResolvedValue(true);
	mockingoose(NotificationLog).toReturn({}, "save");

	await supervisorReminder();

	// Confirm student escalation email was sent
	expect(emailService.sendEmail).toHaveBeenCalledWith(
	    expect.objectContaining({
		to: studentMail,
		subject: expect.stringContaining("Supervisor Not Responding"),
	    })
	);

	// Confirm student escalation notification was logged
	expect(notifLogSpy).toHaveBeenCalledWith(
	    expect.objectContaining({
		submission_id: submissionId,
		type: "studentEscalation",
		recipient_email: studentMail,
	    })
	);

	// Should NOT save the submission (unless you track escalations)
	expect(saveSpy).not.toHaveBeenCalled();
    });
});
