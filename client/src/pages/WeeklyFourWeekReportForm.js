
import React, { useState } from "react";
import axios from "axios";
import "../styles/WeeklyFourWeekReportForm.css";

const WeeklyFourWeekReportForm = () => {
  const userRole = localStorage.getItem("role") || "student"; // Default role is student

  const isStudent = userRole === "student";
  const isSupervisor = userRole === "supervisor";
  const isCoordinator = userRole === "coordinator";

  const [formData, setFormData] = useState({
    week: "Week 1",
    tasks: "",
    lessons: "",
    challenges: "",
    supervisorComments: "",
    coordinatorComments: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      studentId: "123456",
      ...formData,
    };

    console.log("Payload Sending:", payload);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/fourWeekReports`, payload);
      setMessage("✅ Report Submitted Successfully!");

      setFormData({
        week: "Week 1",
        tasks: "",
        lessons: "",
        challenges: "",
        supervisorComments: "",
        coordinatorComments: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Submission Failed! Please try again.");
    }
  };

  return (
    <div className="four-week-container">
      <h2 className="four-week-title">4-Week Progress Report</h2>

      <form onSubmit={handleSubmit}>

        {/* Select Week */}
        <label className="four-week-label">Select Week:</label>
        <select
          name="week"
          className="four-week-select"
          value={formData.week}
          onChange={handleChange}
          disabled={!isStudent}
        >
          {[4, 8, 12, 16].map((week) => (
            <option key={week} value={`Week ${week}`}>
              Week {week}
            </option>
          ))}
        </select>

        {/* Tasks */}
        <label className="four-week-label">Tasks Performed:</label>
        <textarea
          name="tasks"
          className="four-week-textarea"
          placeholder="Mention tasks you worked on..."
          value={formData.tasks}
          onChange={handleChange}
          required
          disabled={!isStudent}
        />

        {/* Lessons */}
        <label className="four-week-label">Lessons Learned:</label>
        <textarea
          name="lessons"
          className="four-week-textarea"
          placeholder="What new did you learn?"
          value={formData.lessons}
          onChange={handleChange}
          required
          disabled={!isStudent}
        />

        {/* Challenges */}
        <label className="four-week-label">Challenges Faced:</label>
        <textarea
          name="challenges"
          className="four-week-textarea"
          placeholder="Mention challenges..."
          value={formData.challenges}
          onChange={handleChange}
          required
          disabled={!isStudent}
        />

        {/* Supervisor Comments */}
        <label className="four-week-label">Supervisor Comments:</label>
        <textarea
          name="supervisorComments"
          className="four-week-textarea"
          placeholder={isSupervisor ? "Enter your comments here..." : "Only Supervisor can fill..."}
          value={formData.supervisorComments}
          onChange={handleChange}
          disabled={!isSupervisor}
        />
        {!isSupervisor && (
          <p style={{ fontSize: "13px", color: "grey" }}>*Only Supervisors are allowed to fill this section.</p>
        )}

        {/* Coordinator Comments */}
        <label className="four-week-label">Coordinator Comments:</label>
        <textarea
          name="coordinatorComments"
          className="four-week-textarea"
          placeholder={isCoordinator ? "Enter your comments here..." : "Only Coordinator can fill..."}
          value={formData.coordinatorComments}
          onChange={handleChange}
          disabled={!isCoordinator}
        />
        {!isCoordinator && (
          <p style={{ fontSize: "13px", color: "grey" }}>*Only Coordinators are allowed to fill this section.</p>
        )}

        <button type="submit" className="four-week-button">Submit</button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default WeeklyFourWeekReportForm;