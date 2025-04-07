const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

router.post('/api/evaluation', async (req, res) => {
  try {
    const { formData, ratings, comments } = req.body;

    const evaluations = Object.keys(ratings).map(category => ({
      category,
      rating: ratings[category],
      comment: comments[category] || ''
    }));

    const newEvaluation = new Evaluation({
      advisorSignature: formData.advisorSignature,
      advisorAgreement: formData.advisorAgreement,
      coordinatorSignature: formData.coordinatorSignature,
      coordinatorAgreement: formData.coordinatorAgreement,
      evaluations
    });

    await newEvaluation.save();
    res.status(201).json({ message: 'Evaluation saved successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

module.exports = router;
