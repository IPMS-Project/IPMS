import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/WeeklyProgressReportForm.css";

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
    // const user = JSON.parse(localStorage.getItem("user"));
    // const studentId = user?.user?._id;

    // // Check if studentId exists in localStorage
    // if (!studentId) {
    //   setMessage("Student ID not found. Please log in again.");
    //   return;
    // }

    // Check that all required fields are filled
    if (
      !formData.week ||
      !formData.hours ||
      !formData.tasks ||
      !formData.lessons
    ) {
      setMessage("Please fill in all the fields.");
      return;
    }

    //! temporary
    const student_name = localStorage.getItem("student_name");
    const payload = { ...formData, student_name };
    //const payload = { studentId, ...formData };

    try {
      // Sending the form data to the backend
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports`,
        payload
      );

      // Display success message
      Swal.fire({
        icon: "success",
        title: "Report Submitted",
        text: "Your weekly progress report has been successfully submitted!",
        confirmButtonColor: "#9d2235",
      });
      setFormData({
        week: "Week 1",
        hours: "",
        tasks: "",
        lessons: "",
        supervisorComments: "",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#9d2235",
      });
    }
  };

  return (
    <div className="a2-form-container">
      <h2 className="form-title">A.2 - Weekly Progress Report</h2>

      <form onSubmit={handleSubmit} className="a2-form">
        {/* Week and Hours Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="week">Logbook Week</label>
            {
              <select
                id="week"
                name="week"
                value={formData.week}
                onChange={handleChange}
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <option key={i} value={`Week ${i + 1}`}>{`Week ${
                    i + 1
                  }`}</option>
                ))}
              </select>
            }
          </div>

          <div className="form-group">
            <label htmlFor="hours">Number of Hours</label>
            <input
              type="number"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="e.g., 12"
              required
              min="0"
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="form-group">
          <label htmlFor="tasks">Tasks Performed</label>
          <textarea
            id="tasks"
            name="tasks"
            value={formData.tasks}
            onChange={handleChange}
            required
            placeholder="Describe the tasks you completed..."
          />
        </div>

        {/* Lessons */}
        <div className="form-group">
          <label htmlFor="lessons">Lessons Learned</label>
          <textarea
            id="lessons"
            name="lessons"
            value={formData.lessons}
            onChange={handleChange}
            required
            placeholder="What did you learn this week?"
          />
        </div>

        {/* Supervisor Comments */}
        <div className="form-group">
          <label htmlFor="supervisorComments">
            Internship Supervisor Comments{" "}
            <span className="optional">(optional)</span>
          </label>
          <textarea
            id="supervisorComments"
            name="supervisorComments"
            value={formData.supervisorComments}
            onChange={handleChange}
            placeholder="Enter comments if supervisor is filling..."
          />
        </div>

        {/* Submit */}
        <button type="submit" className="submit-button">
          Submit Report
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default WeeklyProgressReportForm;
