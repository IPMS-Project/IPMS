import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/WeeklyProgressReportForm.css";

const WeeklyProgressReportForm = ({ role = "student", readOnly = false }) => {
  const navigate = useNavigate();
  const { reportId } = useParams();

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    supervisorName: "",
    supervisorEmail: "",
    coordinatorName: "Dr. Mansoor Abdulhak",
    coordinatorEmail: "sample@gmail.com",
    week: "",
    hours: "",
    tasks: "",
    lessons: "",
    supervisorComments: "",
  });

  const [submittedHours, setSubmittedHours] = useState(0);
  const [requiredHours, setRequiredHours] = useState(0);
  const [creditHours, setCreditHours] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (readOnly && reportId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/reports/${reportId}`)
        .then((res) => {
          if (res.data.success) {
            const {
              fullName,
              email,
              supervisorName,
              supervisorEmail,
              week,
              hours,
              tasks,
              lessons,
              supervisorComments,
            } = res.data.report;

            setFormData({
              fullName: fullName || "",
              email: email || "",
              supervisorName: supervisorName || "",
              supervisorEmail: supervisorEmail || "",
              coordinatorName: "Dr. Mansoor Abdulhak",
              coordinatorEmail: "sample@gmail.com",
              week: week || "",
              hours: hours || "",
              tasks: tasks || "",
              lessons: lessons || "",
              supervisorComments: supervisorComments || "",
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load report", err);
        });
    }
  }, [readOnly, reportId]);

  const handleChange = (e) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchStatus = async () => {
    try {
      if (!formData.email) return;

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/reports/status/${formData.soonerId}`
      );
      
      const { requiredHours, submittedHours, creditHours } = res.data;
      setRequiredHours(requiredHours);
      setSubmittedHours(submittedHours);
      setCreditHours(creditHours);
    } catch (err) {
      console.error("Error fetching report status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Only fetch when email is updated
  }, [formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, week, hours, tasks, lessons } = formData;

    if (!fullName || !email || !week || !hours || !tasks || !lessons) {
      setMessage("Please fill in all the required fields.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports`,
        formData
      );

      setMessage(res.data.message || "Report submitted successfully!");

      setFormData({
        fullName: "",
        email: "",
        supervisorName: "",
        supervisorEmail: "",
        coordinatorName: "Dr. Mansoor Abdulhak",
        coordinatorEmail: "sample@gmail.com",
        week: "",
        hours: "",
        tasks: "",
        lessons: "",
        supervisorComments: "",
      });

      fetchStatus();
    } catch (err) {
      console.error(err);
      setMessage("Submission failed. Try again.");
    }
  };

  return (
    <div className="four-week-container">
      <h2 className="four-week-title">A.2 - Weekly Progress Report</h2>

      <form onSubmit={handleSubmit}>
        <label className="four-week-label">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="four-week-input"
          required
        />

      <form onSubmit={handleSubmit} className="a2-form">
        {/* Student Details */}
        <div className="form-group floating-label-group">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder=" "
            required
            readOnly={readOnly}
          />
          <label>Student Name</label>
        </div>

        <div className="form-group floating-label-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" "
            required
            readOnly={readOnly}
          />
          <label>Student Email</label>
        </div>

        {/* Supervisor Details */}
        <div className="form-group floating-label-group">
          <input
            type="text"
            name="supervisorName"
            value={formData.supervisorName}
            onChange={handleChange}
            placeholder=" "
            readOnly={readOnly}
          />
          <label>Supervisor Name</label>
        </div>

        <div className="form-group floating-label-group">
          <input
            type="email"
            name="supervisorEmail"
            value={formData.supervisorEmail}
            onChange={handleChange}
            placeholder=" "
            readOnly={readOnly}
          />
          <label>Supervisor Email</label>
        </div>

        {/* Coordinator (Always Read-Only, Pre-Filled) */}
        <div className="form-group floating-label-group">
          <input
            type="text"
            name="coordinatorName"
            value={formData.coordinatorName}
            placeholder=" "
            readOnly
          />
          <label>Coordinator Name</label>
        </div>

        <div className="form-group floating-label-group">
          <input
            type="email"
            name="coordinatorEmail"
            value={formData.coordinatorEmail}
            placeholder=" "
            readOnly
          />
          <label>Coordinator Email</label>
        </div>

        {/* Week & Hours */}
        <div className="week-hours-row">
          <div className="form-group">
            <label>Week</label>
            <select
              name="week"
              value={formData.week}
              onChange={handleChange}
              disabled={readOnly}
              required
            >
              <option value="">-- Select Week --</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i} value={`Week ${i + 1}`}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </div>

        <label className="four-week-label">Sooner ID</label>
        <input
          type="text"
          name="soonerId"
          value={formData.soonerId}
          onChange={handleChange}
          className="four-week-input"
          required
        />

        {/* Tasks, Lessons, Comments */}
        <div className="form-group floating-label-group">
          <textarea
            name="tasks"
            value={formData.tasks}
            onChange={handleChange}
            placeholder=" "
            required
            readOnly={readOnly}
          />
          <label>Tasks Performed</label>
          <div className="textarea-count">{formData.tasks.length}/300</div>
        </div>

        <label className="four-week-label">Number of Hours</label>
        <input
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          className="four-week-input"
          required
          placeholder="e.g., 10"
        />

        <label className="four-week-label">Tasks Performed</label>
        <textarea
          name="tasks"
          value={formData.tasks}
          onChange={handleChange}
          className="four-week-textarea"
          required
        />

        <label className="four-week-label">Lessons Learned</label>
        <textarea
          name="lessons"
          value={formData.lessons}
          onChange={handleChange}
          className="four-week-textarea"
          required
        />

        <label className="four-week-label">Supervisor Comments (optional)</label>
        <textarea
          name="supervisorComments"
          value={formData.supervisorComments}
          onChange={handleChange}
          className="four-week-textarea"
        />

        <button type="submit" className="four-week-button">
          Submit Report
        </button>
      </form>

      <div className="progress-section">
        <p>📚 Credit Hours: <strong>{creditHours}</strong></p>
        <p>⏳ Required Hours: <strong>{requiredHours}</strong></p>
        <p>✅ Submitted Hours: <strong>{submittedHours}</strong></p>

        <progress value={submittedHours} max={requiredHours} style={{ width: "100%" }}></progress>

        {submittedHours >= requiredHours && requiredHours > 0 && (
          <div className="completion-box">
            ✅ All required internship hours completed!
            <br />
            <a href="/downloads/FormA2.pdf" className="download-button" download>
              Download Final Approved A.2 Form
            </a>
            <p className="canvas-msg">📎 Please submit this on Canvas after download.</p>
          </div>
        )}
      </div>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default WeeklyProgressReportForm;