
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
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("coordinatorReminder sends email", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const fakeSubmission = {
      _id: submissionId,
      name: "Test Coordinator Submission",
      student_id: new mongoose.Types.ObjectId(),
      coordinator_id: new mongoose.Types.ObjectId(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      supervisor_status: "approved",
      coordinator_status: "pending",
      coordinator_reminder_count: 0,
      last_coordinator_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      studentNotified: false,
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(NotificationLog).toReturn({}, "save");

    emailService.sendEmail.mockResolvedValue(true);

    await coordinatorReminder();

    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Reminder"),
      })
    );
  });
});

describe("supervisorReminder", () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("should send a reminder to the supervisor", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const fakeSubmission = {
      _id: submissionId,
      student_id: studentId,
      supervisor_status: "pending",
      supervisor_reminder_count: 0,
      last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");
    mockingoose(NotificationLog).toReturn({}, "save");

    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
      { ouEmail: "supervisor@example.com", role: "supervisor", isActivated: true },
    ]);
    jest.spyOn(UserTokenRequest, "findById").mockResolvedValue({
      ouEmail: "student@example.com",
    });

    emailService.sendEmail.mockResolvedValue(true);

    await supervisorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Reminder"),
      })
    );
  });
});

describe("supervisorReminder escalation", () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("should return to the student after multiple reminders", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const fakeSubmission = {
      _id: submissionId,
      student_id: studentId,
      supervisor_status: "pending",
      supervisor_reminder_count: 2,
      last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(NotificationLog).toReturn({}, "save");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");

    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([]);
    jest.spyOn(UserTokenRequest, "findById").mockResolvedValue({
      ouEmail: "student@example.com",
    });

    emailService.sendEmail.mockResolvedValue(true);

    await supervisorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: expect.stringContaining("Supervisor Not Responding"),
      })
    );
  });
});
