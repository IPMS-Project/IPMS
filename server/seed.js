const mongoose = require("mongoose");
const User = require("./models/User");
const InternshipRequest = require("./models/InternshipRequest");
const Submission = require("./models/Submission");
const Evaluation = require("./models/Evaluation");

mongoose
  .connect("mongodb://localhost:27017/IPMS")
  .then(() => {
    console.log("MongoDB Connected Successfully");
    return seedData();
  })
  .catch((err) => console.log(err));

async function seedData() {
  try {
    await User.deleteMany();
    await InternshipRequest.deleteMany();
    await Submission.deleteMany();
    await Evaluation.deleteMany();

    console.log("Old Data Removed");

    // 1. Insert Student User
    const studentUser = await User.create({
      userName: "Vijay Chirram",
      email: "vijay.chirram@ou.edu",
      password: "password123",
      role: "student",
    });

    // 2. Insert Coordinator User
    const coordinatorUser = await User.create({
      userName: "Coordinator OU",
      email: "coordinator@ou.edu",
      password: "password123",
      role: "coordinator",
    });

    // 3. Insert Internship Request (Form A1)
    const internshipRequest = await InternshipRequest.create({
      student: studentUser._id,
      workplace: {
        name: "Google",
        website: "https://google.com",
        phone: "1234567890",
      },
      internshipAdvisor: {
        name: "Dr. Smith",
        jobTitle: "Manager",
        email: "drsmith@google.com",
      },
      creditHours: 3,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-01"),
      tasks: [
        {
          description: "Web App Development",
          outcomes: ["problemSolving", "communication"],
        },
      ],
      status: "submitted",
      approvals: ["advisor"],
      completedHours: 50,
    });

    // 4. Insert Submission (Optional)
    await Submission.create({
      name: "Weekly Report 1",
      student_name: "Vijay Chirram",
      details: "Completed initial project setup",
      supervisor_status: "pending",
    });

    // 5. Insert Evaluation (Optional)
    await Evaluation.create({
      interneeId: studentUser._id,
      internshipId: internshipRequest._id,
      evaluations: [
        {
          category: "Communication",
          rating: "Satisfactory",
          comment: "Excellent communication skills",
        },
      ],
      advisorSignature: {
        type: "text",
        value: "Dr.Smith",
      },
      advisorAgreement: true,
      coordinatorSignature: {
        type: "text",
        value: "Coordinator",
      },
      coordinatorAgreement: true,
    });

    console.log("Dummy Data Inserted Successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
