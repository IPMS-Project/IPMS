exports.isSupervisor = (req, res, next) => {
  // const supervisor = Sup.find({$id: username})

  req.user = { role: "supervisor" }; // Mocking user role for demo
  if (req.user.role === "supervisor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a supervisor." });
  }
};

exports.isCoordinator = (req, res, next) => {
  req.user = { role: "coordinator" }; // Mocking role for now (or fetch from DB if implemented)

  if (req.user.role === "coordinator") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a coordinator." });
  }
};
