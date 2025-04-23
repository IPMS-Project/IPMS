const emailService = require("../services/emailService");
const { coordinatorReminder, supervisorReminder } = require("./reminderEmail");
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
    emailService.sendEmail.mockClear();
  });

  it("coordinatorReminder sends email", async () => {
    const submissionId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const coordinatorId = new mongoose.Types.ObjectId();

    const fakeSubmission = {
      _id: submissionId,
      name: "Test Internship",
      student_id: studentId,
      coordinator_id: coordinatorId,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      coordinator_status: "pending",
      supervisor_status: "approved",
      coordinator_reminder_count: 0,
      last_coordinator_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      workplace: { name: "Test Corp" },
      internshipAdvisor: { email: "advisor@test.com" },
      creditHours: 3,
      startDate: new Date("2025-04-01T00:00:00Z"),
      endDate: new Date("2025-04-28T00:00:00Z"),
      student: studentId,
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(NotificationLog).toReturn({}, "save");
    mockingoose(UserTokenRequest).toReturn({}, "findById");

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
    const supervisorId = new mongoose.Types.ObjectId();

    const fakeSubmission = {
      _id: submissionId,
      student_id: studentId,
      supervisor_id: supervisorId,
      supervisor_status: "pending",
      supervisor_reminder_count: 0,
      last_supervisor_reminder_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      workplace: { name: "Workplace name" },
      internshipAdvisor: { email: "advisor@mail.com" },
      creditHours: 3,
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-04-28"),
      student: studentId,
      save: jest.fn(),
    };

    mockingoose(InternshipRequest).toReturn([fakeSubmission], "find");
    mockingoose(WeeklyReport).toReturn([], "find");
    mockingoose(Evaluation).toReturn([], "find");
    jest.spyOn(UserTokenRequest, "find").mockResolvedValue([
      { _id: supervisorId, ouEmail: "supervisor@example.com", isActivated: true, role: "supervisor" },
    ]);
    jest.spyOn(UserTokenRequest, "findById").mockImplementation((id) => {
      if (id.equals(studentId)) {
        return Promise.resolve({ _id: studentId, ouEmail: "student@example.com" });
      }
      return Promise.resolve(null);
    });

    await supervisorReminder();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining("Reminder"),
      })
    );
  });
});
