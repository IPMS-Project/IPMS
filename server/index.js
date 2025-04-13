const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const Evaluation = require("./models/Evaluation");

const formRoutes = require("./routes/formRoutes");
const reportRoutes = require("./routes/weeklyReportRoutes");
const fourWeekReportRoutes = require("./routes/fourWeekReportRoutes");

const emailRoutes = require("./routes/emailRoutes");
const tokenRoutes = require("./routes/token");
const approvalRoutes = require("./routes/approvalRoutes");

const { registerAllJobs, cronJobManager } = require("./utils/cronUtils");

const app = express();
app.use(express.json());
app.use(cors());

const mongoConfig = { /* your mongo config */ };

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, mongoConfig)
  .then(async () => {
    console.log("Connected to Local MongoDB");
    await registerAllJobs();
    console.log("✅ Cron jobs initialized successfully");
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/form", formRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fourWeekReports", fourWeekReportRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api", approvalRoutes);

app.get("/", (req, res) => {
  res.send("IPMS Backend Running");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  try {
    cronJobManager.stopAllJobs();
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
