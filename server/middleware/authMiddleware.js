const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");

exports.isSupervisor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const tokenEntry = await UserTokenRequest.findOne({ token });
    if (!tokenEntry) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(tokenEntry.user_id);
    if (!user || user.role !== "supervisor") {
      return res.status(403).json({ message: "Access denied. Not a supervisor." });
    }

    req.user = user; // make user info available to routes
    next();

  } catch (err) {
    console.error("Supervisor auth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.isCoordinator = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const tokenEntry = await UserTokenRequest.findOne({ token });
    if (!tokenEntry) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(tokenEntry.user_id);
    if (!user || user.role !== "coordinator") {
      return res.status(403).json({ message: "Access denied. Not a coordinator." });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Coordinator auth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
