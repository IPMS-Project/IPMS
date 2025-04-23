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
  });

  it("should send a reminder to the coordinator", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const coordinatorId = new mongoose.Types.ObjectId();

    const doc = new InternshipRequest({
      _id: submissionId,
      name: "Test Submission",
      student_id: studentId,
      coordinator_id: coordinatorId,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      coordinator_status: "pending",
      coordinator_reminder_count: 1,
      last_coordinator_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      studentNotified: false
    });

    mockingoose(InternshipRequest).toReturn([doc], "find");

    jest.spyOn(User, "findById").mockImplementation((id) => {
      if (id.equals(studentId)) {
        return Promise.resolve({ _id: studentId, email: "student@example.com" });
      }
      if (id.equals(coordinatorId)) {
        return Promise.resolve({ _id: coordinatorId, email: "coordinator@example.com" });
      }
      return Promise.resolve(null);
    });

    mockingoose(NotificationLog).toReturn({}, "save");
    const saveSpy = jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

    try {
      await coordinatorReminder();
    } catch (err) {
      console.error("Test execution error (coordinator):", err);
    }

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Reminder"),
      })
    );

    expect(saveSpy).toHaveBeenCalled();
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

    const doc = new InternshipRequest({
      _id: submissionId,
      student_id: studentId,
      supervisor_id: supervisorId,
      supervisor_status: "pending",
      supervisor_reminder_count: 0,
      last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    });

    mockingoose(InternshipRequest).toReturn([doc], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");

    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
      { _id: supervisorId, ouEmail: "supervisor@example.com", role: "supervisor", isActivated: true },
    ]);

    jest.spyOn(UserTokenRequest, "findById").mockImplementation((id) => {
      if (id.equals(studentId)) {
        return Promise.resolve({ _id: studentId, ouEmail: "student@example.com" });
      }
      if (id.equals(supervisorId)) {
        return Promise.resolve({ _id: supervisorId, ouEmail: "supervisor@example.com" });
      }
      return Promise.resolve(null);
    });

    mockingoose(NotificationLog).toReturn({}, "save");
    const saveSpy = jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

    try {
      await supervisorReminder();
    } catch (err) {
      console.error("Test execution error (supervisor):", err);
    }

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Reminder"),
      })
    );

    expect(saveSpy).toHaveBeenCalled();
  });
});
