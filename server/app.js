const cronJobRoutes = require("./routes/cronJobRoutes");
const outcomeRoutes = require('./routes/outcomeRoutes');
const downloadRoutes = require('./routes/formA2Download');

// Add cron job routes
app.use("/api/cron-jobs", cronJobRoutes);

// Add outcomeRoutes
app.use('/api', outcomeRoutes);

// Add download routes
app.use('/api', downloadRoutes);