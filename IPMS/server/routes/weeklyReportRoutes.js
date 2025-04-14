const express = require('express');
const router = express.Router();
const WeeklyReport = require('../models/WeeklyReport');

// POST - Create a new weekly report
router.post('/', async (req, res) => {
  try {
    const report = await WeeklyReport.create(req.body);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - Get reports by studentID
router.get('/student/:id', async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ studentID: req.params.id });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
