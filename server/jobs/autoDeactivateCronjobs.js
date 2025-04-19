const TokenRequest = require("../models/TokenRequest");

const autoDeactivateCronjobs = async () => {
  try {
    const now = new Date();

    const result = await TokenRequest.updateMany(
      {
        expiresAt: { $lt: now },
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
