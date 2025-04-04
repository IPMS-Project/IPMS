// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/IPMS')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Define a Submission model
const submissionSchema = new mongoose.Schema({
    name: String,
    details: String,
    status: { type: String, default: 'Pending' }
});

const Submission = mongoose.model('Submission', submissionSchema);

// API endpoint to retrieve submissions
app.get('/submissions', async (req, res) => {
    try {
        const submissions = await Submission.find();
        res.json(submissions);
    } catch (error) {
        res.status(500).send(error);
    }
});

// server.js
app.delete('/submissions/:id', async (req, res) => {
    try {
        const result = await Submission.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send('Submission not found');
        }
        res.status(200).send('Submission deleted successfully');
    } catch (error) {
        res.status(500).send(error);
    }
});


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
