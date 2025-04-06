const mongoose = require("mongoose");

const TokenRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  ouEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  semester: { type: String, required: true },
  academicAdvisor: { type: String, required: true },
  isStudent: { type: Boolean, default: true },
  token: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  requestedAt: { type: Date, default: Date.now },
  activatedAt: { type: Date },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 
  },
  deletedAt: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "Activated", "Expired", "Deleted"],
    default: "Pending",
  },
});

TokenRequestSchema.index(
  { requestedAt: 1 },
  {
    expireAfterSeconds: 432000,
    partialFilterExpression: { isActivated: false },
  }
);

module.exports = mongoose.model("TokenRequest", TokenRequestSchema);

