const express = require('express');
const app = express();

app.use(express.json());

const cronJobRoutes = require("./routes/cronJobRoutes");
const outcomeRoutes = require('./routes/outcomeRoutes');
const approvalRoutes = require('./routes/approvalRoutes');  

// Add cron job routes
app.use("/api/cron-jobs", cronJobRoutes);

// Add outcome routes
app.use('/api', outcomeRoutes);

// Add approval routes
app.use('/api/approval', approvalRoutes);  
