const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
require("dotenv").config();

const emailRoutes = require("./routes/emailRoutes");
const tokenRoutes = require("./routes/token");

// Import cron job manager and register jobs
const cronJobManager = require("./utils/cronUtils");
const { registerAllJobs } = require("./jobs/registerCronJobs");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/form", formRoutes); // register route as /api/form/submit

const mongoConfig = {
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  family: 4,
};

mongoose
  .connect(process.env.MONGO_URI, mongoConfig)
  .then(async () => {
    console.log("Connected to Local MongoDB");
    // Initialize cron jobs after database connection is established
    try {
      await registerAllJobs();
      console.log("✅ Cron jobs initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize cron jobs:", error);
    }
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

app.get("/", (req, res) => {
  res.send("IPMS Backend Running");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.use("/api/email", emailRoutes);
app.use("/api/token", tokenRoutes);

app.post("/api/createUser", async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;
    const user = new User({ userName, email, password, role });
    await user.save();
    console.log("New user created:", JSON.stringify(user));
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
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
// Graceful shutdown (async Mongoose support)
process.on("SIGINT", async () => {
  try {
    cronJobManager.stopAllJobs();
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
