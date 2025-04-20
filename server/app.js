const cronJobRoutes = require("./routes/cronJobRoutes");
const outcomeRoutes = require('./routes/outcomeRoutes');

// Add cron job routes
app.use("/api/cron-jobs", cronJobRoutes);


// Add outcomeRoutes
app.use('/api', outcomeRoutes);

const formRoutes = require('./routes/formRoutes'); // or your actual path
app.use('/api/form', formRoutes);

