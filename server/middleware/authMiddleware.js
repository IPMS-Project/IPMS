const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");

exports.isSupervisor = (req, res, next) => {
  // const supervisor = Sup.find({$id: username})

  req.user = { role: "supervisor" }; // Mocking user role for demo
  if (req.user.role === "supervisor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a supervisor." });
  }
};

/*
    // This is token management if we'll use it in the future
exports.isSupervisor = async (req, res, next) => {
    try {
        // Token management
        const raw = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
        const token = raw.replace(/^"|"$/g, ""); // removes surrounding quotes

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const tokenEntry = await UserTokenRequest.findOne({ token });
        if (!tokenEntry) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        if (tokenEntry.role !== "supervisor") {
            return res.status(403).json({ message: "Access denied. Not a supervisor." });
        }

        req.user = tokenEntry; // make user info available to routes
        next();
    } catch (err) {
        console.error("Supervisor auth error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
*/

exports.isCoordinator = (req, res, next) => {
  req.user = { role: "coordinator" }; // Mocking role for now (or fetch from DB if implemented)

  if (req.user.role === "coordinator") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a coordinator." });
  }
};
