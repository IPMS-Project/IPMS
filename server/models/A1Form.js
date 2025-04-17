const mongoose = require("mongoose");
const commonFields = require("./Formfields");

const A1FormSchema = new mongoose.Schema({
  ...commonFields,  // ✅ Inject shared fields here

  tasks: [String],  // 🎯 Existing A1-specific field
  cs_outcomes: [String],  // optional: if you're tracking alignment
  submitted_at: Date,
});

module.exports = mongoose.model("A1Form", A1FormSchema);

