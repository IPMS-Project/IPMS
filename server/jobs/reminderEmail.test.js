const emailService = require("../services/emailService");
const { coordinatorReminder, supervisorReminder } = require('./reminderEmail');
const mockingoose = require("mockingoose");
const Submission = require("../models/Submission");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const mongoose = require("mongoose");

jest.mock("../services/emailService");

describe("reminderEmail", () => {
    beforeEach(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});
	
	it("should send a reminder to the coordinator", async () => {
		const submissionId = new mongoose.Types.ObjectId();
		const studentId = new mongoose.Types.ObjectId();
		const studentMail = "student@example.com"
		const coordinatorId = new mongoose.Types.ObjectId();
		const coordinatorMail = "coordinator@example.com"
		
		const fakeSubmission = {
			_id: submissionId,
			name: "Test Submission",
			student_id: studentId,
			coordinator_id: coordinatorId,
			createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
			coordinator_status: "pending",
			coordinator_reminder_count: 0,
			last_coordinator_reminder_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			save: jest.fn(),
		};
	
		// Mocking the Submission model
		mockingoose(Submission).toReturn([fakeSubmission], "find");
		jest.spyOn(User, "findById").mockImplementation((id) => {
			if (id.equals(studentId)) {
				return Promise.resolve({ _id: studentId, email: studentMail });
			}
			if (id.equals(coordinatorId)) {
				return Promise.resolve({ _id: coordinatorId, email: coordinatorMail });
			}
			return Promise.resolve(null);
		});
		mockingoose(NotificationLog).toReturn({}, "save");
		jest.spyOn(Submission.prototype, "save").mockResolvedValue(true);
	
		// Function to be tested
		await coordinatorReminder();
	
		// Expectations
		expect(emailService.sendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
			to: expect.any(String),
			subject: expect.stringContaining("Reminder")
			})
		);
		
		expect(Submission.prototype.save).toHaveBeenCalled();
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
	
	const fakeSubmission = {
	    _id: submissionId,
	    name: "Test Submission",
	    student_id: studentId,
	    supervisor_id: supervisorId,
	    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
	    supervisor_status: "pending",
	    supervisor_reminder_count: 0,
	    last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
	    save: jest.fn(),
	};

	// Mocking the Submission model
	mockingoose(Submission).toReturn([fakeSubmission], "find");
	jest.spyOn(User, "findById").mockImplementation((id) => {
	    if (id.equals(studentId)) {
		return Promise.resolve({ _id: studentId, email: studentMail });
	    }
	    if (id.equals(supervisorId)) {
		return Promise.resolve({ _id: supervisorId, email: supervisorMail });
	    }
	    return Promise.resolve(null);
	});
	mockingoose(NotificationLog).toReturn({}, "save");
	jest.spyOn(Submission.prototype, "save").mockResolvedValue(true);

	// Function to be tested
	await supervisorReminder();

	// Expectations
	expect(emailService.sendEmail).toHaveBeenCalledWith(
	    expect.objectContaining({
		to: expect.any(String),
		subject: expect.stringContaining("Reminder")
	    })
	);
	
	expect(Submission.prototype.save).toHaveBeenCalled();
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

	const fakeSubmissionData = {
	    _id: submissionId,
	    name: "Escalation Case",
	    student_id: studentId,
	    supervisor_id: supervisorId,
	    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
	    supervisor_status: "pending",
	    supervisor_reminder_count: 2, // trigger escalation
	    last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // older than 5 days
	};

	mockingoose(Submission).toReturn([fakeSubmissionData], "find");

	jest.spyOn(User, "findById").mockImplementation((id) => {
	    if (id.equals(studentId)) {
		return Promise.resolve({ _id: studentId, email: studentMail });
	    }
	    if (id.equals(supervisorId)) {
		return Promise.resolve({ _id: supervisorId, email: supervisorMail });
	    }
	    return Promise.resolve(null);
	});

	const saveSpy = jest.spyOn(Submission.prototype, "save").mockResolvedValue(true);
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
		submissionId: submissionId,
		type: "studentEscalation",
		recipientEmail: studentMail,
	    })
	);

	// Should NOT save the submission (unless you track escalations)
	expect(saveSpy).not.toHaveBeenCalled();
    });
});
