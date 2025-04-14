require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const formRoutes = require("./routes/formRoutes");
const Evaluation = require("./models/Evaluation");
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

// MongoDB Connection Config
const mongoConfig = {
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  family: 4,
};

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, mongoConfig)
  .then(async () => {
    console.log("Connected to Local MongoDB");
    await registerAllJobs();
    console.log("✅ Cron jobs initialized successfully");
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

app.post("/api/evaluation", async (req, res) => {
  try {
    const { formData, ratings, comments } = req.body;

    const evaluations = Object.keys(ratings).map((category) => ({
      category,
      rating: ratings[category],
      comment: comments[category] || "",
    }));

    const newEvaluation = new Evaluation({
      advisorSignature: formData.advisorSignature,
      advisorAgreement: formData.advisorAgreement,
      coordinatorSignature: formData.coordinatorSignature,
      coordinatorAgreement: formData.coordinatorAgreement,
      evaluations,
    });

    await newEvaluation.save();
    res.status(201).json({ message: "Evaluation saved successfully!" });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({ error: "Failed to save evaluation" });
  }
});


//Form A.4

const presentationRoutes = require("./routes/presentationRoutes");
app.use("/api/presentation", presentationRoutes);


// Graceful shutdown (async Mongoose support)
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
