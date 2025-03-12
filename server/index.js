const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User"); // Import User model
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("IPMS Backend Running");
});

// Test Communication Route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Create User Endpoint
app.post("/api/users", async (req, res) => {
  try {
    const { fullName, email, semester, academicAdvisor } = req.body;
    const user = new User({ fullName, email, semester, academicAdvisor });
    await user.save();
    console.log(JSON.stringify(user));
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
