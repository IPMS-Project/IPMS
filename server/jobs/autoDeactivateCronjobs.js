const TokenRequest = require("../models/TokenRequest");

const autoDeactivateCronjobs = async () => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const result = await TokenRequest.updateMany(
      {
        expiresAt: { 
          $gte: startOfToday,
          $lt: endOfToday, },
        status: "activated",
      },
      {
        $set: {
          status: "deactivated",
          deactivationReason: "token_expired",
        },
      }
    );

    console.log(`Auto-deactivated ${result.modifiedCount} users`);
  } catch (error) {
    console.error("Error in auto-deactivation:", error);
  }
};

module.exports = autoDeactivateCronjobs;
