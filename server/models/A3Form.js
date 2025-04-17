const mongoose = require("mongoose");
const commonFields = require("./Formfields");

const A3FormSchema = new mongoose.Schema({
  ...commonFields,

  evaluation: {
    task_execution: String,
    initiative: String,
    communication: String,
    time_management: String,
    comments: String
  },
  final_grade: String  // "S" or "U"
});

module.exports = mongoose.model("A3Form", A3FormSchema);

