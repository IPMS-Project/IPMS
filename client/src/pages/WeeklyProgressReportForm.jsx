import React, { useState } from "react";

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    tasks: "",
    challenges: "",
    lessons: "",
    week: "Week 1",
    hours: "",
    outcomes: [],
  });

  const [submittedReports, setSubmittedReports] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const outcomes = checked
          ? [...prev.outcomes, value]
          : prev.outcomes.filter((item) => item !== value);
        return { ...prev, outcomes };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tasks.trim()) newErrors.tasks = "Tasks field is required.";
    if (!formData.challenges.trim()) newErrors.challenges = "Challenges field is required.";
    if (!formData.lessons.trim()) newErrors.lessons = "Lessons field is required.";
    if (!formData.hours || Number(formData.hours) <= 0)
      newErrors.hours = "Hours must be greater than 0.";
    if (formData.outcomes.length < 3)
      newErrors.outcomes = "Please select at least 3 CS outcomes.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittedReports([...submittedReports, formData]);

    alert("Report submitted successfully!");

    setFormData({
      tasks: "",
      challenges: "",
      lessons: "",
      week: "Week 1",
      hours: "",
      outcomes: [],
    });

    setErrors({});
  };

  return (
    <div className="dashboard">
      <h1>Weekly Progress Report</h1>
      <form onSubmit={handleSubmit} className="signup-form">

        <div className="form-group">
          <label>Tasks Done</label>
          <textarea
            name="tasks"
            value={formData.tasks}
            onChange={handleChange}
          />
          {errors.tasks && <p style={{ color: "red" }}>{errors.tasks}</p>}
        </div>

        <div className="form-group">
          <label>Challenges</label>
          <textarea
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
          />
          {errors.challenges && <p style={{ color: "red" }}>{errors.challenges}</p>}
        </div>

        <div className="form-group">
          <label>Lessons Learned</label>
          <textarea
            name="lessons"
            value={formData.lessons}
            onChange={handleChange}
          />
          {errors.lessons && <p style={{ color: "red" }}>{errors.lessons}</p>}
        </div>

        <div className="form-group">
          <label>Logbook Week</label>
          <select name="week" value={formData.week} onChange={handleChange}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i}>Week {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Hours Worked</label>
          <input
            type="number"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            placeholder="Enter hours worked this week"
          />
          {errors.hours && <p style={{ color: "red" }}>{errors.hours}</p>}
        </div>

        <div className="form-group">
          <label>CS Outcomes (Select at least 3)</label>
          {["Problem Solving", "Teamwork", "Decision Making", "Communication", "Application", "Leadership"].map((outcome) => (
            <label key={outcome}>
              <input
                type="checkbox"
                name="outcomes"
                value={outcome}
                checked={formData.outcomes.includes(outcome)}
                onChange={handleChange}
              />
              {outcome}
            </label>
          ))}
          {errors.outcomes && <p style={{ color: "red" }}>{errors.outcomes}</p>}
        </div>

        <button className="submit-button" type="submit">
          Submit Report
        </button>
      </form>

      <div className="submitted-reports" style={{ marginTop: "30px" }}>
        <h2>Submitted Reports</h2>
        {submittedReports.length === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          submittedReports.map((report, index) => (
            <div key={index} className="dashboard-card">
              <p><strong>Week:</strong> {report.week}</p>
              <p><strong>Tasks:</strong> {report.tasks}</p>
              <p><strong>Challenges:</strong> {report.challenges}</p>
              <p><strong>Lessons:</strong> {report.lessons}</p>
              <p><strong>Hours:</strong> {report.hours}</p>
              <p><strong>Outcomes:</strong> {report.outcomes.join(", ")}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WeeklyProgressReportForm;
