const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    console.log("Login attempt:", { email, password, role });

    const user = await User.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") }, // case-insensitive
      password: password,
      role: role,
    });

    if (!user) {
      console.log("Login failed: user not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Login success:", user.email);
    res.json({ message: "Login successful", user });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
