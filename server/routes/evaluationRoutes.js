const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

//POST: Submit A3 Form
router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;
    const newEvaluation = new Evaluation(formData);
    await newEvaluation.save();
    res.status(201).json({ message: 'A3 form submitted successfully.' });
  } catch (error) {
    console.error('Error submitting A3 form:', error);
    res.status(500).json({ error: 'Failed to submit A3 form.' });
  }
});

//GET: Fetch A3 Forms for Supervisor Dashboard
router.get('/', async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ supervisor_status: "pending" }).sort({ createdAt: -1 }); // ⬅️ Add sorting
        res.status(200).json(evaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({ error: 'Failed to fetch evaluations.' });
    }
  });

//POST: Approve A3 Form
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const updated = await Evaluation.findByIdAndUpdate(
      id,
      {
        supervisor_status: 'approved',
        supervisor_comment: comment || '',
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Form not found.' });
    res.status(200).json({ message: 'Form approved successfully.', updated });
  } catch (error) {
    console.error('Error approving A3 form:', error);
    res.status(500).json({ error: 'Failed to approve request.' });
  }
});

//Reject A3 Form
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const updated = await Evaluation.findByIdAndUpdate(
      id,
      {
        supervisor_status: 'rejected',
        supervisor_comment: comment || '',
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Form not found.' });
    res.status(200).json({ message: 'Form rejected successfully.', updated });
  } catch (error) {
    console.error('Error rejecting A3 form:', error);
    res.status(500).json({ error: 'Failed to reject request.' });
  }
});

module.exports = router;
