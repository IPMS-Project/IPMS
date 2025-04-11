const cronJobManager = require("../utils/cronUtils");
const { getCronJobs } = require("./cronJobsConfig");
const { registerAllJobs } = require("./registerCronJobs");

jest.mock("../utils/cronUtils");
jest.mock("./cronJobsConfig");

describe("registerCronJobs", () => {
  beforeEach(() => {
    cronJobManager.registerJob.mockClear();
    getCronJobs.mockClear();
  });

  it("registers coordinator cron job", async () => {
    // Mock the getCronJobs function to return our test configuration
    getCronJobs.mockResolvedValue({
      coordinatorApprovalReminder: {
        schedule: "*/2 * * * *",
        job: jest.fn(),
        options: {
          timezone: "Asia/Kolkata",
        },
      },
    });

    await registerAllJobs();

    // Check registerJob was called with correct parameters
    expect(cronJobManager.registerJob).toHaveBeenCalledTimes(1);
    expect(cronJobManager.registerJob).toHaveBeenCalledWith(
      "coordinatorApprovalReminder",
      "*/2 * * * *",
      expect.any(Function),
      {
        timezone: "Asia/Kolkata",
        runOnInit: false,
      }
    );
  });
});
