const emailService = require("../services/emailService");
const {
  coordinatorReminder,
  supervisorReminder,
  internshipHourReminder,
} = require("./reminderEmail");
const mockingoose = require("mockingoose");
const Submission = require("../models/Submission");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const mongoose = require("mongoose");

jest.mock("../services/emailService");

describe("reminderEmail", () => {
  beforeEach(() => {
    emailService.sendEmail.mockClear();
  });

  it("coordinatorReminder sends email", async () => {
    await coordinatorReminder();
    // Check sendEmail was called
    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: process.env.EMAIL_DEFAULT_SENDER,
      subject: "Reminder: Coordinator Approval Pending",
      html: "<p>This is a cron-based reminder email from IPMS.</p>",
      text: "Reminder: Coordinator Approval Pending",
    });
  });
});

// Supervisor reminder test

describe("supervisorReminder", () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("should send a reminder to the supervisor", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const studentMail = "student@example.com";
    const supervisorId = new mongoose.Types.ObjectId();
    const supervisorMail = "supervisor@example.com";

    const fakeSubmission = {
      _id: submissionId,
      name: "Test Submission",
      student_id: studentId,
      supervisor_id: supervisorId,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      supervisor_status: "pending",
      supervisor_reminder_count: 0,
      last_supervisor_reminder_at: new Date(
        Date.now() - 6 * 24 * 60 * 60 * 1000
      ),
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
        subject: expect.stringContaining("Reminder"),
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
    const studentMail = "student@example.com";
    const supervisorId = new mongoose.Types.ObjectId();
    const supervisorMail = "supervisor@example.com";

    const fakeSubmissionData = {
      _id: submissionId,
      name: "Escalation Case",
      student_id: studentId,
      supervisor_id: supervisorId,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      supervisor_status: "pending",
      supervisor_reminder_count: 2, // trigger escalation
      last_supervisor_reminder_at: new Date(
        Date.now() - 6 * 24 * 60 * 60 * 1000
      ), // older than 5 days
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

    const saveSpy = jest
      .spyOn(Submission.prototype, "save")
      .mockResolvedValue(true);
    const notifLogSpy = jest
      .spyOn(NotificationLog, "create")
      .mockResolvedValue(true);
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

describe("internshipHourReminder", () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("should send reminder if completed hours < required", async () => {
    const studentId = new mongoose.Types.ObjectId();
    const mockEmail = "student@example.com";
    const mockName = "Test Student";

    const fakeRequest = {
      _id: new mongoose.Types.ObjectId(),
      creditHours: 3, // required = 180
      completedHours: 100, // < 180 → should trigger reminder
      student: studentId, // just the ref here
    };

    // Mock InternshipRequest to return the document with a reference to student
    mockingoose(InternshipRequest).toReturn([fakeRequest], "find");

    // Mock the populate result to include student email and name
    jest.spyOn(User, "findById").mockResolvedValue({
      _id: studentId,
      ouEmail: mockEmail,
      fullName: mockName,
    });

    // Trigger the reminder function
    await internshipHourReminder();

    // Assert email sent properly
    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Weekly Reminder"),
        html: expect.stringContaining(mockName),
      })
    );
  });

  it("should NOT send reminder if completed hours >= required", async () => {
    const studentId = new mongoose.Types.ObjectId();

    const fakeRequest = {
      _id: new mongoose.Types.ObjectId(),
      creditHours: 2, // required = 120
      completedHours: 120, // exactly met → no reminder
      student: studentId,
    };

    mockingoose(InternshipRequest).toReturn([fakeRequest], "find");

    // Even if student is found, no reminder should be sent
    jest.spyOn(User, "findById").mockResolvedValue({
      _id: studentId,
      ouEmail: "teststudent@ou.edu",
      fullName: "Test Student",
    });

    await internshipHourReminder();

    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });
});
