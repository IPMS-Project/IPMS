const path = require('path');
const fs = require('fs');

// Load keyword dictionary from JSON
const keywordsPath = path.join(__dirname, '../utils/cs_outcome_keywords.json');
const outcomeDict = JSON.parse(fs.readFileSync(keywordsPath, 'utf8'));

// Main alignment logic
const alignOutcomes = (req, res) => {
    console.log("alignOutcomes API hit");

  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Invalid tasks input' });
  }

  const results = tasks.map(task => {
    const matchedOutcomes = new Set();

    for (const [outcome, keywords] of Object.entries(outcomeDict)) {
      for (const keyword of keywords) {
        if (task.toLowerCase().includes(keyword.toLowerCase())) {
          matchedOutcomes.add(outcome);
        }
      }
    }

    return {
      task,
      matched_outcomes: Array.from(matchedOutcomes)
    };
  });

  res.status(200).json({ results });
};

module.exports = { alignOutcomes };
