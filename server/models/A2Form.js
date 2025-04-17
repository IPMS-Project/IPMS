const mongoose = require("mongoose");
const commonFields = require("./Formfields");

const A2FormSchema = new mongoose.Schema({
  ...commonFields,

  week_logs: [
    {
      week: Number,
      hours: Number,
      tasks: String,
      lessons: String,
    }
  ],
  total_hours: Number,
});

module.exports = mongoose.model("A2Form", A2FormSchema);

