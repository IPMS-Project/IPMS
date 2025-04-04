/**
 * Weekly Report Submission Form (Form A.2)
 *
 * ⚠️ Note for Saiteja:
 * This form is currently functional and used for backend testing.
 * You're welcome to:
 * - Reuse this as-is and add it inside your Student Dashboard
 * - Or build your own version and replace this page
 *
 * Minimal validations are included for now. Final UI/UX is up to the dashboard layout.
 */

import React, { useState } from "react";
import axios from "axios";

function ReportForm() {
  const [formData, setFormData] = useState({
    studentID: "", // TEMP: will hardcode or fetch from context
    logbookWeek: "",
    numberOfHours: "",
    task: "",
    challenge: "",
    lesson: "",
    csOutcomes: [],
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let updated = [...prev.csOutcomes];
      if (checked) {
        updated.push(value);
      } else {
        updated = updated.filter((item) => item !== value);
      }
      return { ...prev, csOutcomes: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation
    if (
      !formData.logbookWeek ||
      !formData.numberOfHours ||
      isNaN(formData.numberOfHours) ||
      !formData.task ||
      !formData.challenge ||
      !formData.lesson
    ) {
      setMessage("Please fill out all fields.");
      return;
    }

    if (formData.csOutcomes.length === 0) {
      setMessage("Please select at least one CS Outcome.");
      return;
    }

    // TEMP: use a real studentID once login context is setup
    const payload = { ...formData, studentID: "PASTE_STUDENT_ID_HERE" };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports`,
        payload
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error submitting report:", error);
      setMessage("Submission failed. Try again.");
    }
  };

  return (
    <div className="report-form-container">
      <h2>Submit Weekly Report (Form A.2)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Logbook Week:</label>
          <input
            type="text"
            name="logbookWeek"
            value={formData.logbookWeek}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Number of Hours:</label>
          <input
            type="number"
            name="numberOfHours"
            value={formData.numberOfHours}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Task:</label>
          <input
            type="text"
            name="task"
            value={formData.task}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Challenge:</label>
          <input
            type="text"
            name="challenge"
            value={formData.challenge}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Lesson Learned:</label>
          <input
            type="text"
            name="lesson"
            value={formData.lesson}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>CS Outcomes:</label>
          <div>
            <label>
              <input
                type="checkbox"
                value="Teamwork"
                onChange={handleCheckbox}
              />
              Teamwork
            </label>
            <label>
              <input
                type="checkbox"
                value="Problem Solving"
                onChange={handleCheckbox}
              />
              Problem Solving
            </label>
            <label>
              <input
                type="checkbox"
                value="Communication"
                onChange={handleCheckbox}
              />
              Communication
            </label>
          </div>
        </div>

        <button type="submit">Submit Report</button>
      </form>

      {message && <p className="response-message">{message}</p>}
    </div>
  );
}

export default ReportForm;
