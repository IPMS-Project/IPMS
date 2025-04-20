const emailService = require("../services/emailService");
const { coordinatorReminder, supervisorReminder } = require("./reminderEmail");
const mockingoose = require("mockingoose");
const InternshipRequest = require("../models/InternshipRequest");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const NotificationLog = require("../models/NotifLog");
const UserTokenRequest = require("../models/TokenRequest");
const mongoose = require("mongoose");

// ✅ Proper mocking
jest.mock("../services/emailService", () => ({
  sendEmail: jest.fn(),
}));

describe("reminderEmail", () => {
  beforeEach(() => {
    emailService.sendEmail.mockClear();
  });

  it("coordinatorReminder sends email", async () => {
    await coordinatorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: process.env.EMAIL_DEFAULT_SENDER,
        subject: "Reminder: Coordinator Approval Pending",
        html: expect.stringContaining("cron-based reminder"),
        text: expect.any(String),
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
    const studentMail = "student@example.com";
    const supervisorMail = "supervisor@example.com";

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
      internshipAdvisor: { email: "advisor.mail@ou.edu" },
      workplace: { name: "Workplace name" },
      student: studentId,
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeInternshipRequest], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");

    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
      { _id: supervisorId, ouEmail: supervisorMail, role: "supervisor", isActivated: true }
    ]);

    jest.spyOn(UserTokenRequest, "findById").mockImplementation((id) => {
      if (id.equals(studentId)) return Promise.resolve({ _id: studentId, ouEmail: studentMail });
      if (id.equals(supervisorId)) return Promise.resolve({ _id: supervisorId, ouEmail: supervisorMail });
      return Promise.resolve(null);
    });

    jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);
    mockingoose(NotificationLog).toReturn({}, "save");

    await supervisorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.stringContaining("supervisor"),
        subject: expect.stringContaining("Reminder"),
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

  it("should escalate to the student after 2+ reminders", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const supervisorId = new mongoose.Types.ObjectId();
    const studentMail = "student@example.com";
    const supervisorMail = "supervisor@example.com";

    const fakeRequest = {
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
      internshipAdvisor: { email: "advisor.mail@ou.edu" },
      workplace: { name: "Workplace name" },
      student: studentId,
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeRequest], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");

    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
      { _id: supervisorId, ouEmail: supervisorMail, role: "supervisor", isActivated: true }
    ]);

    jest.spyOn(UserTokenRequest, "findById").mockImplementation((id) => {
      if (id.equals(studentId)) return Promise.resolve({ _id: studentId, ouEmail: studentMail });
      if (id.equals(supervisorId)) return Promise.resolve({ _id: supervisorId, ouEmail: supervisorMail });
      return Promise.resolve(null);
    });

    const notifLogSpy = jest.spyOn(NotificationLog, "create").mockResolvedValue(true);
    const saveSpy = jest.spyOn(InternshipRequest.prototype, "save").mockResolvedValue(true);

    await supervisorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: studentMail,
        subject: expect.stringContaining("Supervisor Not Responding"),
      })
    );

    expect(notifLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: submissionId,
        type: "studentEscalation",
        recipient_email: studentMail,
      })
    );

    expect(saveSpy).not.toHaveBeenCalled(); // Only escalate, not save
  });
});
