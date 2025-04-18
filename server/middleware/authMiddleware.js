const isSupervisor = (req, res, next) => {
  req.user = { role: "supervisor" }; // mock
  if (req.user.role === "supervisor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a supervisor." });
  }
};

const isCoordinator = (req, res, next) => {
  req.user = { role: "coordinator" }; // mock
  if (req.user.role === "coordinator") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a coordinator." });
  }
};

const isStudent = (req, res, next) => {
  req.user = { role: "student" }; // mock
  if (req.user.role === "student") {
    next();
  } else {
    res.status(403).json({ message: "Student access denied" });
  }
};

module.exports = {
  isSupervisor,
  isCoordinator,
  isStudent,
};
