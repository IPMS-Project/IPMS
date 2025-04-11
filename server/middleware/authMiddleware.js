exports.isSupervisor = (req, res, next) => {
  // const supervisor = Sup.find({$id: username})


  req.user = { role: 'supervisor' }; // Mocking user role for demo
  if (req.user.role === "supervisor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not a supervisor." });
  }
};