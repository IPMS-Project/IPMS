

import React, { useState } from "react";
import axios from "axios";
import "./WeeklyProgressReportForm.css"; // optional: for clean styling

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    week: "Week 1",
    hours: "",
    tasks: "",
    lessons: "",
    supervisorComments: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Get the user ID from localStorage (ensure it exists)
    const user = JSON.parse(localStorage.getItem("user"));
    const studentId = user?.user?._id;
  
    // Check if studentId exists in localStorage
    if (!studentId) {
      setMessage("Student ID not found. Please log in again.");
      return;
    }
  
    // Check that all required fields are filled
    if (!formData.week || !formData.hours || !formData.tasks || !formData.lessons) {
      setMessage("Please fill in all the fields.");
      return;
    }
  
    const payload = { studentId, ...formData };
  
    try {
      // Sending the form data to the backend
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports`, payload);
  
      // Display success message
      setMessage(res.data.message || "Report submitted!");
      setFormData({
        week: "Week 1",
        hours: "",
        tasks: "",
        lessons: "",
        supervisorComments: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Submission failed. Try again.");
    }
  };
  

  return (
    <div className="a2-form-container">
      <h2>A.2 - Weekly Progress Report</h2>
      <form onSubmit={handleSubmit} className="a2-form">
        <div className="form-row">
          <label>
            Logbook Week:
            <select name="week" value={formData.week} onChange={handleChange}>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i} value={`Week ${i + 1}`}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Number of Hours:
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
              placeholder="e.g., 12"
            />
          </label>
        </div>

        <div className="form-group">
          <label>Tasks Performed:</label>
          <textarea
            name="tasks"
            value={formData.tasks}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Lessons Learned:</label>
          <textarea
            name="lessons"
            value={formData.lessons}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Internship Supervisor Approval & Comments:</label>
          <textarea
            name="supervisorComments"
            value={formData.supervisorComments}
            onChange={handleChange}
            placeholder="(Optional) If supervisor is filling directly"
          />
        </div>

        <button type="submit" className="submit-button">
          Submit Report
        </button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default WeeklyProgressReportForm;
