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
    cronJobManager.jobs.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create instance of CronJobManager", () => {
    expect(cronJobManager).toBeDefined();
    expect(cronJobManager.jobs).toEqual(new Map());
    expect(cronJobManager.logger).toEqual(logger);
  });

  describe("registerJob", () => {
    it("should register a job successfully with runOnInit", () => {
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
      expect(logger.info).toHaveBeenCalledWith(
        `Running job testJob immediately on init`
      );
    });

    it("should register a job successfully without runOnInit", () => {
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
      expect(logger.info).not.toHaveBeenCalledWith(
        `Running job testJob immediately on init`
      );
    });

    it("should NOT register job with invalid cron expression", () => {
      cron.validate.mockReturnValue(false);

      const result = cronJobManager.registerJob(
        "InvalidJob",
        "invalid",
        mockJobFunction
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Invalid cron expression: invalid"
      );
    });

    it("should warn and replace an already existing job", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });

      cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
      const result = cronJobManager.registerJob(
        "testJob",
        "*/10 * * * *",
        mockJobFunction
      );

      expect(result).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        "Job 'testJob' already exists. Replacing it..."
      );
      expect(logger.info).toHaveBeenCalledWith("Stopped job: testJob");
    });
  });

  describe("stopJob", () => {
    it("should stop a running job", () => {
      cron.validate.mockReturnValue(true);
      const stopFn = jest.fn();
      cron.schedule.mockReturnValue({ stop: stopFn });

      cronJobManager.registerJob("JobToStop", "*/5 * * * *", mockJobFunction);
      cronJobManager.stopJob("JobToStop");

      expect(stopFn).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Stopped job: JobToStop");
    });
  });

  describe("listJobs", () => {
    it("should list all registered jobs", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });

      cronJobManager.registerJob("JobToList", "*/1 * * * *", mockJobFunction);

      const jobs = cronJobManager.listJobs();
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].name).toBe("JobToList");
    });
  });
});
