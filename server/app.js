const cronJobRoutes = require("./routes/cronJobRoutes");

// Add cron job routes
app.use("/api/cron-jobs", cronJobRoutes);
