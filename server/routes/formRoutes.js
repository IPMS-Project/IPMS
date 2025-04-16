const express = require('express');
const router = express.Router();
const { insertFormData } = require('../services/insertData');

let status = '';

// Validate required fields
function validateFormData(formData) {
  const requiredFields = [
    'soonerId',
    'workplaceName',
    'website',
    'phone',
    'advisorName',
    'advisorJobTitle',
    'advisorEmail',
    'creditHours',
    'startDate',
    'endDate',
    'tasks'
  ];

  for (const field of requiredFields) {
    if (!formData[field] || formData[field] === '') {
      return `Missing or empty required field: ${field}`;
    }
  }

  if (!/^[0-9]{9}$/.test(formData.soonerId))
    return `Sooner ID must be a 9-digit number, not ${formData.soonerId}`;

  if (!Array.isArray(formData.tasks) || formData.tasks.length === 0) {
    return 'Tasks must be a non-empty array';
  }
  // for (const [index, task] of formData.tasks.entries()) {
  //   if (!task.description || !task.outcomes) {
  //     return `Task at index ${index} is missing description or outcomes`;
  //   }
  // }

  // uncomment below if student has to fill in task outcomes
  // const filledTasks = formData.tasks.filter((task) => task.description && task.outcomes );  
  // if (filledTasks.length < 3)
  //   return `At least 3 tasks must have description and outcomes; only ${filledTasks.length} do`;

  const tasks = formData.tasks;
  console.log(tasks);
  if (tasks.filter((task) => task.description).length < 3)
    return 'At least 3 tasks must be provided';
  const uniqueOutcomes = new Set();
  tasks.forEach((task) => {
    if (Array.isArray(task.outcomes)) {
      task.outcomes.forEach(outcome => uniqueOutcomes.add(outcome));
    } 
  });
  formData.status = uniqueOutcomes.size < 3 ? 'pending manual review' : 'submitted';
  return null;
}

router.post('/submit', async (req, res) => {
  const formData = req.body;
  const validationError = validateFormData(formData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await insertFormData(formData);
    res.status(200).json({ message: 'Form received and handled!', status, manual: formData.status !== 'submitted'});
  } catch (error) {
    console.error('Error handling form data:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
