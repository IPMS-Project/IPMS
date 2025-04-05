import React, { useState } from "react";

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    tasks: "",
    challenges: "",
    lessons: "",
    week: "Week 1",
    outcomes: [],
  });

  const [submittedReports, setSubmittedReports] = useState([]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.outcomes.length < 3) {
      alert("Please select at least 3 CS Outcomes.");
      return;
    }
    setSubmittedReports([...submittedReports, formData]);
    setFormData({
      tasks: "",
      challenges: "",
      lessons: "",
      week: "Week 1",
      outcomes: [],
    });
  };

  return (
    <div className="dashboard">
      <h1>Weekly Progress Report</h1>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label>Tasks Done</label>
          <textarea name="tasks" value={formData.tasks} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Challenges</label>
          <textarea name="challenges" value={formData.challenges} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Lessons Learned</label>
          <textarea name="lessons" value={formData.lessons} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Week</label>
          <select name="week" value={formData.week} onChange={handleChange}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i}>Week {i + 1}</option>
            ))}
          </select>
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
        </div>

        <button className="submit-button" type="submit">
          Submit Report
        </button>
      </form>

      <div className="submitted-reports">
        <h2>Submitted Reports</h2>
        {submittedReports.map((report, index) => (
          <div key={index} className="dashboard-card">
            <p><strong>Week:</strong> {report.week}</p>
            <p><strong>Tasks:</strong> {report.tasks}</p>
            <p><strong>Challenges:</strong> {report.challenges}</p>
            <p><strong>Lessons:</strong> {report.lessons}</p>
            <p><strong>Outcomes:</strong> {report.outcomes.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyProgressReportForm;
