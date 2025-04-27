const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");

// Supervisor authentication middleware
const isSupervisor = async (req, res, next) => {
    try {
        // Token management
        const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

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

// 🔹 Coordinator Middleware
const isCoordinator = (req, res, next) => {
    req.user = { role: "coordinator" }; // Mocking user role for demo
    if (req.user.role === "coordinator") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a coordinator." });
  }
};

// 🔹 Student Middleware
const isStudent = (req, res, next) => {
  const ipmsUser = JSON.parse(req.headers["ipms-user"] || "{}");
  if (ipmsUser && ipmsUser.role === "student") {
    req.user = ipmsUser; // Includes _id
    next();
  } else {
    res.status(403).json({ message: "Student access denied" });
  }
};

module.exports = {
    isStudent,
    isSupervisor,
    isCoordinator,
};
