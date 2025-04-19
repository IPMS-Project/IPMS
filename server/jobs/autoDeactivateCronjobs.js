const TokenRequest = require("../models/TokenRequest");

const autoDeactivateExpiredTokens = async () => {
  try {
    const now = new Date();

    const result = await TokenRequest.updateMany(
      {
        expiryDate: { $lt: now },
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

module.exports = autoDeactivateExpiredTokens;
