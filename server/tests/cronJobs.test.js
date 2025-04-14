const cronJobManager = require("../utils/cronUtils");
const cron = require("node-cron");

// Mock the cron.schedule function
jest.mock("node-cron", () => ({
  schedule: jest.fn().mockReturnValue({
    stop: jest.fn(),
  }),
  validate: jest
    .fn()
    .mockImplementation((expression) => expression !== "invalid"),
}));

describe("CronJobManager", () => {
  beforeEach(() => {
    // Clear all jobs and reset mocks before each test
    cronJobManager.jobs.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    cronJobManager.jobs.clear();
  });

  describe("registerJob", () => {
    it("should register a valid cron job", () => {
      const jobName = "testJob";
      const cronExpression = "* * * * *";
      const jobFunction = jest.fn();

      const result = cronJobManager.registerJob(
        jobName,
        cronExpression,
        jobFunction
      );

      expect(result).toBe(true);
      expect(cronJobManager.listJobs()).toContainEqual(
        expect.objectContaining({
          name: jobName,
          cronExpression: cronExpression,
        })
      );
    });

    it("should reject invalid cron expression", () => {
      const jobName = "invalidJob";
      const invalidCronExpression = "invalid";
      const jobFunction = jest.fn();

      const result = cronJobManager.registerJob(
        jobName,
        invalidCronExpression,
        jobFunction
      );

      expect(result).toBe(false);
      expect(cronJobManager.listJobs()).not.toContainEqual(
        expect.objectContaining({
          name: jobName,
        })
      );
    });

    it("should replace existing job with same name", () => {
      const jobName = "duplicateJob";
      const firstCronExpression = "* * * * *";
      const secondCronExpression = "*/2 * * * *";
      const jobFunction = jest.fn();

      cronJobManager.registerJob(jobName, firstCronExpression, jobFunction);
      cronJobManager.registerJob(jobName, secondCronExpression, jobFunction);

      const jobs = cronJobManager.listJobs();
      expect(jobs.filter((job) => job.name === jobName)).toHaveLength(1);
      expect(jobs).toContainEqual(
        expect.objectContaining({
          name: jobName,
          cronExpression: secondCronExpression,
        })
      );
    });
  });

  describe("listJobs", () => {
    it("should return empty array when no jobs are registered", () => {
      expect(cronJobManager.listJobs()).toEqual([]);
    });

    it("should return all registered jobs", () => {
      const jobs = [
        { name: "job1", cronExpression: "* * * * *" },
        { name: "job2", cronExpression: "*/2 * * * *" },
      ];

      jobs.forEach((job) => {
        cronJobManager.registerJob(job.name, job.cronExpression, jest.fn());
      });

      const listedJobs = cronJobManager.listJobs();
      expect(listedJobs).toHaveLength(2);
      jobs.forEach((job) => {
        expect(listedJobs).toContainEqual(
          expect.objectContaining({
            name: job.name,
            cronExpression: job.cronExpression,
          })
        );
      });
    });
  });
});
