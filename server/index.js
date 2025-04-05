const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User"); // Import User model
require("dotenv").config();

// Import routes
const emailRoutes = require("./routes/emailRoutes");

// Import cron job manager and register jobs
const cronJobManager = require("./utils/cronUtils");
require("./jobs/registerCronJobs");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Configuration
const mongoConfig = {
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10,
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
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error after initial connection:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Lost MongoDB connection...");
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
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
});

// Cron job management API endpoints
app.get("/api/cron/jobs", (req, res) => {
  try {
    const jobs = cronJobManager.listJobs();
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/cron/jobs/:name", (req, res) => {
  const { name } = req.params;
  const { cronExpression } = req.body;
  if (!cronExpression) {
    return res.status(400).json({
      success: false,
      error: "Missing required field: cronExpression",
    });
  }
  const result = cronJobManager.updateJobSchedule(name, cronExpression);
  if (result) {
    res.json({ success: true, message: `Job ${name} updated successfully` });
  } else {
    res.status(404).json({
      success: false,
      error: `Job ${name} not found or invalid cron expression`,
    });
  }
});

app.delete("/api/cron/jobs/:name", (req, res) => {
  const { name } = req.params;
  const result = cronJobManager.stopJob(name);
  if (result) {
    res.json({ success: true, message: `Job ${name} stopped successfully` });
  } else {
    res.status(404).json({ success: false, error: `Job ${name} not found` });
  }
});

app.post("/api/cron/jobs/:name/restart", (req, res) => {
  const { name } = req.params;
  const result = cronJobManager.restartJob(name);
  if (result) {
    res.json({ success: true, message: `Job ${name} restarted successfully` });
  } else {
    res.status(404).json({ success: false, error: `Job ${name} not found` });
  }
});

// Graceful shutdown (async Mongoose support)
process.on("SIGINT", async () => {
  try {
    cronJobManager.stopAllJobs();
    await mongoose.connection.close(); // updated to promise version
    console.log("✅ MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
