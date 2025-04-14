const sendReminderMailsToSupervisors = require("./reminderSupervisor");

const jobFunctions = {
  supervisorApprovalReminder: sendReminderMailsToSupervisors,
  // Add more jobs here if needed
};

module.exports = {
  jobFunctions,
};
