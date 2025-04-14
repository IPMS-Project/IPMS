const cron = require("node-cron");
const logger = require("./logger");
const cronJobManager = require("./cronUtils");

jest.mock("node-cron", () => ({
  validate: jest.fn(),
  schedule: jest.fn(),
}));

jest.mock("./logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("cronUtils", () => {
  let mockJobFunction;

  beforeEach(() => {
    mockJobFunction = jest.fn().mockResolvedValue();

    cron.validate.mockClear();
    cron.schedule.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    logger.error.mockClear();

    cronJobManager.stopAllJobs(); // Clean state before each test
  });

  afterEach(() => {
    cronJobManager.stopAllJobs(); // Ensure clean state after each test
    jest.clearAllMocks();
  });

  it("should create an instance of CronJobManager", () => {
    expect(cronJobManager).toBeDefined();
    expect(cronJobManager.jobs).toEqual(new Map());
    expect(cronJobManager.logger).toEqual(logger);
  });

  describe("registerJob", () => {
    it("should register job with runOnInit = true", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });

      const result = cronJobManager.registerJob(
        "testJob",
        "*/5 * * * *",
        mockJobFunction,
        { runOnInit: true }
      );

      expect(result).toBe(true);
      expect(cron.schedule).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith("Running job testJob immediately on init");
    });

    it("should register job with runOnInit = false", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });

      const result = cronJobManager.registerJob(
        "testJob",
        "*/5 * * * *",
        mockJobFunction,
        { timezone: "UTC" }
      );

      expect(result).toBe(true);
      expect(cron.schedule).toHaveBeenCalledTimes(1);
      expect(logger.info).not.toHaveBeenCalledWith("Running job testJob immediately on init");
    });

    it("should return false for invalid cron expression", () => {
      cron.validate.mockReturnValue(false);

      const result = cronJobManager.registerJob(
        "invalidJob",
        "invalid-cron",
        mockJobFunction
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("Invalid cron expression: invalid-cron");
      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should replace duplicate job", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });

      cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
      const result = cronJobManager.registerJob("testJob", "*/10 * * * *", mockJobFunction);

      expect(result).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith("Job 'testJob' already exists. Replacing it...");
      expect(logger.info).toHaveBeenCalledWith("Stopped job: testJob");
    });
  });

  it("should stop a given job", () => {
    cron.validate.mockReturnValue(true);
    cron.schedule.mockReturnValue({ stop: jest.fn() });

    cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
    cronJobManager.stopJob("testJob");

    expect(logger.info).toHaveBeenCalledWith("Stopped job: testJob");
  });

  it("should list registered jobs", () => {
    cron.validate.mockReturnValue(true);
    cron.schedule.mockReturnValue({ stop: jest.fn() });

    cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
    const jobs = cronJobManager.listJobs();

    expect(jobs[0].name).toBe("testJob");
  });
});
