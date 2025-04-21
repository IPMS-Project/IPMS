const mongoose = require("mongoose");

const coordinatorReviewSchema = new mongoose.Schema({
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
  supervisorComments: {
    type: String,
    default: "",
  },
  coordinatorComments: {
    type: String,
    required: true,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CoordinatorReview", coordinatorReviewSchema);
