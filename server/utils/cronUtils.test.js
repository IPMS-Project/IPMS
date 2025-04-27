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
  const mockJobFunction = jest.fn().mockResolvedValue();

  beforeEach(() => {
    cron.validate.mockClear();
    cron.schedule.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    logger.error.mockClear();
    cronJobManager.stopAllJobs();
  });

  afterEach(() => {
    cronJobManager.stopAllJobs();
    jest.clearAllMocks();
  });

  test("should create an instance of CronJobManager", () => {
    expect(cronJobManager).toBeDefined();
    expect(cronJobManager.jobs instanceof Map).toBe(true);
  });

  test("should register job with runOnInit = true", () => {
    cron.validate.mockReturnValue(true);
    cron.schedule.mockReturnValue({ stop: jest.fn() });

    const result = cronJobManager.registerJob(
      "Job1",
      "*/1 * * * *",
      mockJobFunction,
      { runOnInit: true }
    );

    expect(result).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Running job Job1 immediately on init`
    );
  });

  test("should register job with runOnInit = false", () => {
    cron.validate.mockReturnValue(true);
    cron.schedule.mockReturnValue({ stop: jest.fn() });

    const result = cronJobManager.registerJob(
      "Job2",
      "*/1 * * * *",
      mockJobFunction
    );

    expect(result).toBe(true);
  });

  test("should not register job with invalid cron", () => {
    cron.validate.mockReturnValue(false);

    const result = cronJobManager.registerJob("InvalidJob", "invalid", mockJobFunction);

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      "Invalid cron expression: invalid"
    );
  });
  test("should stop a specific job", () => {
    cron.validate.mockReturnValue(true);
    const stopFn = jest.fn();
    cron.schedule.mockReturnValue({ stop: stopFn });

    cronJobManager.registerJob("Job3", "*/1 * * * *", mockJobFunction);
    cronJobManager.stopJob("Job3");

    expect(stopFn).toHaveBeenCalled();
  });

  test("should list registered jobs", () => {
    cron.validate.mockReturnValue(true);
    cron.schedule.mockReturnValue({ stop: jest.fn() });

    cronJobManager.registerJob("Job4", "*/1 * * * *", mockJobFunction);

    const jobs = cronJobManager.listJobs();
    expect(jobs.length).toBeGreaterThan(0);
  });
});
