const emailService = require("../services/emailService");
const { coordinatorReminder, supervisorReminder } = require('./reminderEmail');
const mockingoose = require("mockingoose");
const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const NotificationLog = require("../models/NotifLog");
const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");
const mongoose = require("mongoose");

jest.mock("../services/emailService");

describe("reminderEmail", () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("coordinatorReminder sends email", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const coordinatorId = new mongoose.Types.ObjectId();

    const fakeSubmission = {
      _id: submissionId,
      name: "Test Submission",
      student_id: studentId,
      coordinator_id: coordinatorId,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      coordinator_status: "pending",
      supervisor_status: "approved",
      coordinator_reminder_count: 0,
      last_coordinator_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      save: jest.fn()
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");

    jest.spyOn(User, "findById").mockImplementation((id) => {
      if (id.equals(studentId)) return Promise.resolve({ email: "student@example.com" });
      if (id.equals(coordinatorId)) return Promise.resolve({ email: "coordinator@example.com" });
      return Promise.resolve(null);
    });

    jest.spyOn(NotificationLog, "create").mockResolvedValue(true);
    jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

    await coordinatorReminder();

    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Reminder")
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
    const supervisorId = new mongoose.Types.ObjectId();

    const fakeSubmission = {
      _id: submissionId,
      student_id: studentId,
      supervisor_id: supervisorId,
      supervisor_status: "pending",
      supervisor_reminder_count: 1,
      last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      save: jest.fn()
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");

    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
      { _id: supervisorId, ouEmail: "supervisor@example.com", role: "supervisor", isActivated: true }
    ]);

    jest.spyOn(UserTokenRequest, "findById").mockResolvedValue({ ouEmail: "student@example.com" });
    jest.spyOn(NotificationLog, "create").mockResolvedValue(true);
    jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

    await supervisorReminder();

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

    const fakeSubmission = {
      _id: submissionId,
      student_id: studentId,
      supervisor_status: "pending",
      supervisor_reminder_count: 2,
      last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      save: jest.fn()
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");

    jest.spyOn(UserTokenRequest, "findById").mockResolvedValue({ ouEmail: "student@example.com" });
    jest.spyOn(NotificationLog, "create").mockResolvedValue(true);
    const saveSpy = jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

    await supervisorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: expect.stringContaining("Supervisor Not Responding")
      })
    );

    expect(NotificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: submissionId,
        type: "studentEscalation",
        recipient_email: "student@example.com"
      })
    );

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
