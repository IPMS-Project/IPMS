const cronJobManager = require("../utils/cronUtils");
const coordinatorReminder = require("./reminderEmail");

jest.mock("../utils/cronUtils");

describe("registerCronJobs", () => {
  beforeEach(() => {
    cronJobManager.registerJob.mockClear();
  });

  it("registers coordinator cron job", () => {
    require("./registerCronJobs");
    // Check registerJob was called
    expect(cronJobManager.registerJob).toHaveBeenCalledTimes(1);
    expect(cronJobManager.registerJob).toHaveBeenCalledWith(
      "coordinatorApprovalReminder",
      "*/2 * * * *",
      coordinatorReminder,
      {
        timezone: "Asia/Kolkata",
      }
    );
  });
});
