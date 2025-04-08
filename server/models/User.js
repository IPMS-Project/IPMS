const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  role: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
