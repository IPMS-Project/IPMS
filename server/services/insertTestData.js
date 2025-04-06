const mongoose = require('mongoose');
const InternshipRequest = require("C:\\Users\\nethra\\Desktop\\IPMS\\IPMS\\server\\models\\InternshipRequest.js"); // Adjust the path

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/internshipDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB for test data insertion'))
.catch(err => console.error('Connection error:', err));

// Sample data
const testData = [
  {
    student: new mongoose.Types.ObjectId(), // Random student ID
    workplace: {
      name: 'Tech Solutions Inc.',
      website: 'https://techsolutions.com',
      phone: '123-456-7890'
    },
    internshipAdvisor: {
      name: 'John Smith',
      jobTitle: 'Senior Developer',
      email: 'john.smith@techsolutions.com'
    },
    creditHours: 3,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-08-31'),
    tasks: [
      {
        description: 'Develop REST APIs for client project',
        outcomes: ['problemSolving', 'solutionDev']
      },
      {
        description: 'Participate in team meetings',
        outcomes: ['communication', 'collaboration']
      }
    ],
    status: 'approved',
    approvals: ['advisor', 'coordinator'],
    completedHours: 45
  },
  {
    student: new mongoose.Types.ObjectId(), // Random student ID
    workplace: {
      name: 'Digital Marketing Agency',
      website: 'https://digitalmarketing.example.com',
      phone: '987-654-3210'
    },
    internshipAdvisor: {
      name: 'Sarah Johnson',
      jobTitle: 'Marketing Director',
      email: 'sarah.j@digitalmarketing.com'
    },
    creditHours: 2,
    startDate: new Date('2023-07-01'),
    endDate: new Date('2023-09-30'),
    tasks: [
      {
        description: 'Create social media content',
        outcomes: ['communication', 'application']
      },
      {
        description: 'Analyze campaign metrics',
        outcomes: ['problemSolving', 'decisions']
      }
    ],
    status: 'submitted',
    approvals: ['advisor'],
    completedHours: 30
  }
];

// Insert data function
async function insertTestData() {
  try {
    // Clear existing data (optional)
    await InternshipRequest.deleteMany({});
    
    // Insert new test data
    const result = await InternshipRequest.insertMany(testData);
    console.log(`${result.length} documents inserted`);
    
    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting test data:', error);
    mongoose.connection.close();
  }
}

// Run the insertion
insertTestData();