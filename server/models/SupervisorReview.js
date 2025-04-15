const mongoose = require("mongoose");

const supervisorReviewSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  groupIndex: {
    type: Number,
    required: true,
  },
  weeks: {
    type: [String],
    required: true,
  },
  comments: {
    type: String,
    required: true,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SupervisorReview", supervisorReviewSchema);
