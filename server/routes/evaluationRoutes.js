const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// POST: Submit Evaluation Form A.3
router.post('/submit', async (req, res) => {
  try {
    const data = req.body;

    // Basic validation: required fields check
    if (
      !data.interneeName || 
      !data.interneeID || 
      !data.interneeEmail ||
      !data.evaluations || 
      data.evaluations.length !== 3
    ) {
      return res.status(400).json({ message: 'Missing required fields or invalid number of evaluations' });
    }

    const evaluation = new Evaluation({
      interneeName: data.interneeName,
      interneeID: data.interneeID,
      interneeEmail: data.interneeEmail,
      evaluations: data.evaluations,
      advisorSignature: data.advisorSignature,
      advisorAgreement: data.advisorAgreement,
      coordinatorSignature: data.coordinatorSignature,
      coordinatorAgreement: data.coordinatorAgreement,
      status: 'submitted',
      submittedAt: new Date()
    });

    await evaluation.save();
    res.status(201).json({ message: 'Evaluation submitted successfully' });

  } catch (err) {
    console.error('Error submitting evaluation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
