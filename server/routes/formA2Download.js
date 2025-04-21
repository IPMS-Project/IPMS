const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/downloads/formA2.pdf', (req, res) => {
  const filePath = path.join(__dirname, '../client/downloads/formA2.pdf');
  res.contentType('application/pdf');
  res.sendFile(filePath);
});

module.exports = router;