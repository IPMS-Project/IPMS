import React, { useState } from "react";
import axios from "axios";

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    logbookWeek: "Week 1",
    numberOfHours: "",
    tasksPerformed: "",
    challengesFaced: "",
    lessonsLearned: "",
    csOutcomes: [],
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [submittedReports, setSubmittedReports] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const updated = checked
          ? [...prev.csOutcomes, value]
          : prev.csOutcomes.filter((item) => item !== value);
        return { ...prev, csOutcomes: updated };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tasksPerformed.trim())
      newErrors.tasksPerformed = "Tasks are required.";
    if (!formData.challengesFaced.trim())
      newErrors.challengesFaced = "Challenges are required.";
    if (!formData.lessonsLearned.trim())
      newErrors.lessonsLearned = "Lessons are required.";
    if (formData.numberOfHours === "") {
      newErrors.numberOfHours = "This field cannot be empty.";
    } else if (Number(formData.numberOfHours) <= 0) {
      newErrors.numberOfHours = "Hours must be a positive number.";
    }

    if (formData.csOutcomes.length === 0)
      newErrors.csOutcomes = "Select at least one CS outcome.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const student = JSON.parse(localStorage.getItem("user"));
    const studentId = student?.user._id;

    console.log(localStorage.getItem("user"));

    if (!studentId) {
      setMessage("Student ID not found. Please login again.");
      return;
    }

    const payload = {
      studentId,
      ...formData,
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports`,
        payload
      );
      setMessage(res.data.message || "Report submitted!");
      setSubmittedReports([...submittedReports, payload]);

      setFormData({
        logbookWeek: "Week 1",
        numberOfHours: "",
        tasksPerformed: "",
        challengesFaced: "",
        lessonsLearned: "",
        csOutcomes: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting report:", error);
      setMessage("Submission failed. Try again.");
    }
  };

  return (
    <div className="dashboard">
      <h1>Weekly Progress Report (Form A.2)</h1>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label>Tasks Performed</label>
          <textarea
            name="tasksPerformed"
            value={formData.tasksPerformed}
            onChange={handleChange}
          />
          {errors.tasksPerformed && (
            <p style={{ color: "red" }}>{errors.tasksPerformed}</p>
          )}
        </div>

        <div className="form-group">
          <label>Challenges Faced</label>
          <textarea
            name="challengesFaced"
            value={formData.challengesFaced}
            onChange={handleChange}
          />
          {errors.challengesFaced && (
            <p style={{ color: "red" }}>{errors.challengesFaced}</p>
          )}
        </div>

        <div className="form-group">
          <label>Lessons Learned</label>
          <textarea
            name="lessonsLearned"
            value={formData.lessonsLearned}
            onChange={handleChange}
          />
          {errors.lessonsLearned && (
            <p style={{ color: "red" }}>{errors.lessonsLearned}</p>
          )}
        </div>

        <div className="form-group">
          <label>Logbook Week</label>
          <select
            name="logbookWeek"
            value={formData.logbookWeek}
            onChange={handleChange}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i}>Week {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Number of Hours</label>
          <input
            type="number"
            name="numberOfHours"
            value={formData.numberOfHours}
            onChange={handleChange}
            placeholder="e.g., 15"
          />
          {errors.numberOfHours && (
            <p style={{ color: "red" }}>{errors.numberOfHours}</p>
          )}
        </div>

        <div className="form-group">
          <label>CS Outcomes (Select at least 1)</label>
          {[
            "Problem Solving",
            "Teamwork",
            "Decision Making",
            "Communication",
            "Application",
            "Leadership",
          ].map((outcome) => (
            <label key={outcome}>
              <input
                type="checkbox"
                name="csOutcomes"
                value={outcome}
                checked={formData.csOutcomes.includes(outcome)}
                onChange={handleChange}
              />
              {outcome}
            </label>
          ))}
          {errors.csOutcomes && (
            <p style={{ color: "red" }}>{errors.csOutcomes}</p>
          )}
        </div>

        <button className="submit-button" type="submit">
          Submit Report
        </button>
      </form>

      {message && (
        <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
      )}

      <div className="submitted-reports" style={{ marginTop: "30px" }}>
        <h2>Submitted Reports</h2>
        {submittedReports.length === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          submittedReports.map((report, index) => (
            <div key={index} className="dashboard-card">
              <p>
                <strong>Week:</strong> {report.logbookWeek}
              </p>
              <p>
                <strong>Tasks:</strong> {report.tasksPerformed}
              </p>
              <p>
                <strong>Challenges:</strong> {report.challengesFaced}
              </p>
              <p>
                <strong>Lessons:</strong> {report.lessonsLearned}
              </p>
              <p>
                <strong>Hours:</strong> {report.numberOfHours}
              </p>
              <p>
                <strong>Outcomes:</strong> {report.csOutcomes.join(", ")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WeeklyProgressReportForm;
