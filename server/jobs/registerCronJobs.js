const cronJobManager = require("../utils/cronUtils");
const coordinatorReminder = require("./reminderEmail");

cronJobManager.registerJob(
  "coordinatorApprovalReminder",
  "*/2 * * * *",
  coordinatorReminder,
  {
    runOnInit: true,
    timezone: "Asia/Kolkata",
  }
);
