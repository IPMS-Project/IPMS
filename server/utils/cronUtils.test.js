<<<<<<< HEAD
// cronUtils.test.js
=======
>>>>>>> 93e35288ab1e47c5ea3fa173cbceccbef36defc0
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
<<<<<<< HEAD
  let mockJobFunction;

  beforeEach(() => {
    mockJobFunction = jest.fn().mockResolvedValue();
=======
  const mockJobFunction = jest.fn().mockResolvedValue();

  beforeEach(() => {
>>>>>>> 93e35288ab1e47c5ea3fa173cbceccbef36defc0
    cron.validate.mockClear();
    cron.schedule.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    logger.error.mockClear();
<<<<<<< HEAD
    cronJobManager.jobs.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("create instance of CronJobManager", () => {
    expect(cronJobManager).toBeDefined();
    expect(cronJobManager.jobs).toEqual(new Map());
    expect(cronJobManager.logger).toEqual(logger);
  });

  describe("registerJob", () => {

    beforeEach(() => {
      cron.validate.mockClear();
      cron.schedule.mockClear();
      logger.info.mockClear();
      logger.warn.mockClear();
      logger.error.mockClear();
    })

    it("registerJob succeeds with runOnInit", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });
      const result = cronJobManager.registerJob(
        "testJob",
        "*/5 * * * *",
        mockJobFunction,
        { runOnInit: true }
      );
      // Check scedule and logger.info
      expect(result).toBe(true);
      expect(cron.schedule).toHaveBeenCalledTimes(1);
      expect(cron.schedule).toHaveBeenCalledWith(
        "*/5 * * * *",
        expect.any(Function),
        expect.objectContaining({ scheduled: true })
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Running job testJob immediately on init`
      );
    });

    it("registerJob succeeds without runOnInit", () => {
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
      expect(cron.schedule).toHaveBeenCalledWith(
        "*/5 * * * *",
        expect.any(Function),
        expect.objectContaining({ scheduled: true, timezone: "UTC" })
      );
      expect(logger.info).not.toHaveBeenCalledWith(
        `Running job testJob immediately on init`
      );
    });

    it("registerJob errors with invalid cron", () => {
      cron.validate.mockReturnValue(false);
      const result = cronJobManager.registerJob(
        "invalidJob",
        "invalid-cron-expression",
        mockJobFunction
      );
      // Check the correct logs were sent
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Invalid cron expression: invalid-cron-expression"
      );
      expect(logger.info).toHaveBeenCalledTimes(0);
    });

    it("registerJob warns & replaces duplicate jobs", () => {
      cron.validate.mockReturnValue(true);
      cron.schedule.mockReturnValue({ stop: jest.fn() });
      // Create Job to check against
      cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
      // attempt to register with same job name
      const result = cronJobManager.registerJob(
        "testJob",
        "*/10 * * * *",
        mockJobFunction
      );
      // Check correct logs were sent
      expect(result).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        "Job 'testJob' already exists. Replacing it..."
      );
      expect(logger.info).toHaveBeenCalledWith("Stopped job: testJob");
    });
  });

  it("stopJob stops a given job", () => {
    cron.validate.mockReturnValue(true);
    cron.schedule.mockReturnValue({ stop: jest.fn() });
    // Create Job to stop
    cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
    // Check that it exists
    expect(cronJobManager.jobs.has("testJob")).toBe(true);
    // remove it
    cronJobManager.stopJob("testJob");
    // check that its gone
    expect(logger.info).toHaveBeenCalledWith("Stopped job: testJob");
  });

  it("listJobs prints out jobs", () => {
    cron.validate.mockReturnValue(true);
    // Create Job to list
    cronJobManager.registerJob("testJob", "*/5 * * * *", mockJobFunction);
    const result = cronJobManager.listJobs();
    expect(result[0].name).toBe("testJob");
  });

=======
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
>>>>>>> 93e35288ab1e47c5ea3fa173cbceccbef36defc0
});
