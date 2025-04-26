const User = require("../models/User");
const UserTokenRequest = require("../models/TokenRequest");

// 🔹 Supervisor Middleware
const isSupervisor = (req, res, next) => {
  req.user = { role: "supervisor" }; // Mocking user role for demo
  if (req.user.role === "supervisor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a supervisor." });
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

// Export all properly
module.exports = {
  isSupervisor,
  isCoordinator,
  isStudent,
};
