const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema({
  type: { type: String, enum: ["text", "draw"], required: true },
  value: { type: String, required: true },
  font: { type: String } // used only if type is 'text'
}, { _id: false });

const evaluationItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["Presentation Content", "Delivery and Communication", "Answering Questions"]
  },
  rating: {
    type: String,
    enum: ["Satisfactory", "Unsatisfactory"],
    required: true
  },
  comment: {
    type: String,
    default: ""
  }
}, { _id: false });

const presentationEvaluationSchema = new mongoose.Schema({
  interneeName: { type: String, required: true },
  interneeID: { type: String, required: true }, // Sooner ID (9-digit)
  interneeEmail: { type: String, required: true },

  companyName: { type: String, required: true },
  companyWebsite: { type: String },
  companyPhone: { type: String },

  advisorName: { type: String, required: true },
  advisorTitle: { type: String, required: true },
  advisorEmail: { type: String, required: true },

  presentationDate: { type: Date, required: true },

  evaluations: {
    type: [evaluationItemSchema],
    validate: [arr => arr.length === 3, "All 3 evaluation categories must be filled"]
  },

  coordinatorSignature: {
    type: signatureSchema,
    required: true
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PresentationEvaluation", presentationEvaluationSchema);
