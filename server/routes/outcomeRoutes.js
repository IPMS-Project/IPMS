const express = require('express');
const router = express.Router();
const { alignOutcomes } = require('../controllers/outcomeAlignController');

router.post('/align-outcomes', alignOutcomes);

module.exports = router;
