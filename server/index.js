const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User"); // Import User model
require("dotenv").config();

// Import routes
const emailRoutes = require("./routes/emailRoutes");

// Import cron job manager
const cronJobManager = require("./utils/cronUtils");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Configuration
const mongoConfig = {
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// MongoDB Local Connection
mongoose
  .connect(process.env.MONGO_URI, mongoConfig)
  .then(() => {
    console.log("Connected to Local MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // Exit if cannot connect to database
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error after initial connection:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Lost MongoDB connection...");
  // Attempt to reconnect
  if (!mongoose.connection.readyState) {
    mongoose
      .connect(process.env.MONGO_URI, mongoConfig)
      .then(() => console.log("Reconnected to MongoDB"))
      .catch((err) => console.error("Error reconnecting to MongoDB:", err));
  }
});

// Basic Route
app.get("/", (req, res) => {
  res.send("IPMS Backend Running");
});

// Test Communication Route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Register routes
app.use("/api/email", emailRoutes);

// Create User Endpoint
app.post("/api/createUser", async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;
    const user = new User({ userName, email, password, role });
    await user.save();
    console.log("New user created:", JSON.stringify(user));
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// Initialize cron jobs
require("./utils/cronJobs");

// Remove all cron-related API endpoints

// Graceful shutdown
process.on("SIGINT", () => {
  // Stop all cron jobs before shutting down
  cronJobManager.stopAllJobs();

  mongoose.connection.close(() => {
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
