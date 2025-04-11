const mongoose = require("mongoose");

const cronJobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    default: {},
  },
  lastRun: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("CronJob", cronJobSchema);
