const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// Supervisor submits Final Job Performance Evaluation (Form A.3)
router.post('/submit-evaluation', async (req, res) => {
  try {
    const {
      interneeName,
      interneeID,
      interneeEmail,
      evaluations,
      advisorSignature,
      advisorAgreement,
      coordinatorSignature,
      coordinatorAgreement,
      submittedBy // optional
    } = req.body;

    // Basic required field validation
    if (
      !interneeName || !interneeID || !interneeEmail ||
      !evaluations || evaluations.length === 0 ||
      !advisorSignature || !advisorAgreement ||
      !coordinatorSignature || !coordinatorAgreement
    ) {
      return res.status(400).json({ message: 'Missing required fields for submission.' });
    }

    const newEvaluation = new Evaluation({
      interneeName,
      interneeID,
      interneeEmail,
      evaluations,
      advisorSignature,
      advisorAgreement,
      coordinatorSignature,
      coordinatorAgreement,
      status: 'submitted',
      submittedAt: new Date(),
      submittedBy
    });

    await newEvaluation.save();

    return res.status(200).json({ message: 'Form A.3 submitted successfully!' });

  } catch (error) {
    console.error('Form A.3 submission error:', error);
    res.status(500).json({ message: 'Server error during evaluation submission.' });
  }
});

module.exports = router;
