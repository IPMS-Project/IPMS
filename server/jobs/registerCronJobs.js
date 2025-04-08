const cronJobManager = require("../utils/cronUtils");
const coordinatorReminder = require("./reminderEmail");

cronJobManager.registerJob(
  "coordinatorApprovalReminder",
  "*/2 * * * *",
  coordinatorReminder,
  {
    timezone: "Asia/Kolkata",
  }
);
