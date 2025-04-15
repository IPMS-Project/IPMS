require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const Evaluation = require("./models/Evaluation");

const formRoutes = require("./routes/formRoutes");
const emailRoutes = require("./routes/emailRoutes");
const tokenRoutes = require("./routes/token");
const approvalRoutes = require("./routes/approvalRoutes");
const outcomeRoutes = require("./routes/outcomeRoutes");
const weeklyReportRoutes = require("./routes/weeklyReportRoutes");
const fourWeekReportRoutes = require("./routes/fourWeekReportRoutes");

const { cronJobManager } = require("./utils/cronUtils");
const { registerAllJobs } = require("./jobs/registerCronJobs");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/form", formRoutes); // register route as /api/form/submit
app.use("/api/email", emailRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api", outcomeRoutes);

// MongoDB Config
const mongoConfig = {
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  family: 4,
};

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, mongoConfig)
  .then(async () => {
    console.log("Connected to Local MongoDB");
    await registerAllJobs();
    console.log("✅ Cron jobs initialized successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/form", formRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api", approvalRoutes);
app.use("/api", outcomeRoutes);
app.use("/api/reports", weeklyReportRoutes);
app.use("/api/fourWeekReports", fourWeekReportRoutes);

app.get("/", (req, res) => {
  res.send("IPMS Backend Running");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.use("/api/email", emailRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api", approvalRoutes);

app.use("/api/reports", weeklyReportRoutes);
// API for creating user
app.post("/api/createUser", async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;
    const user = new User({ userName, email, password, role });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
});

// API for Evaluation form
app.post("/api/evaluation", async (req, res) => {
  try {
    const { interneeName, interneeID, interneeEmail, advisorSignature, advisorAgreement, coordinatorSignature, coordinatorAgreement, ratings, comments } = req.body;

    const evaluations = Object.keys(ratings).map((category) => ({
      category,
      rating: ratings[category],
      comment: comments[category] || "",
    }));

    const newEvaluation = new Evaluation({
      interneeName,
      interneeID,
      interneeEmail,
      advisorSignature,
      advisorAgreement,
      coordinatorSignature,
      coordinatorAgreement,
      evaluations,
    });

    await newEvaluation.save();
    res.status(201).json({ message: "Evaluation saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save evaluation" });
  }
});


//Form A.4

const presentationRoutes = require("./routes/presentationRoutes");
app.use("/api/presentation", presentationRoutes);


// Graceful shutdown (async Mongoose support)
// Serve frontend static files
app.use(express.static(path.join(__dirname, "../client/build")));

// All other routes to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  try {
    cronJobManager.stopAllJobs();
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed gracefully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
