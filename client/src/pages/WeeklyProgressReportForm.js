import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/WeeklyProgressReportForm.css";

const WeeklyProgressReportForm = ({ role = "student", readOnly = false }) => {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [formData, setFormData] = useState({
    week: "",
    hours: "",
    tasks: "",
    lessons: "",
    supervisorComments: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (readOnly && reportId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/reports/${reportId}`)
        .then((res) => {
          if (res.data.success) {
            const { week, hours, tasks, lessons, supervisorComments } =
              res.data.report;

            setFormData({
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

    if (name === "hours") {
      const hoursValue = parseInt(value);
      if (hoursValue > 40) {
        setFormData((prev) => ({ ...prev, [name]: 40 }));
        return;
      }
      if (hoursValue < 1 && value !== "") {
        setFormData((prev) => ({ ...prev, [name]: 1 }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { week, hours, tasks, lessons } = formData;

    if (!week || !hours || !tasks || !lessons) {
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
        week: "",
        hours: "",
        tasks: "",
        lessons: "",
        supervisorComments: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Submission failed. Please try again.");
    }
  };

  return (
    <div className="a2-form-container">
      <h2>Weekly Progress Report</h2>

      <button
        className="view-submissions-btn"
        onClick={() => navigate("/submitted-reports")}
      >
        View Previous Submissions
      </button>

      <form onSubmit={handleSubmit} className="a2-form">
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

          <div className="form-group floating-label-group">
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder=" "
              required
              min="1"
              max="40"
              readOnly={readOnly}
            />
            <label>Hours Worked</label>
          </div>
        </div>

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

        <div className="form-group floating-label-group">
          <textarea
            name="lessons"
            value={formData.lessons}
            onChange={handleChange}
            placeholder=" "
            required
            readOnly={readOnly}
          />
          <label>Lessons Learned</label>
          <div className="textarea-count">{formData.lessons.length}/300</div>
        </div>

        <div className="form-group floating-label-group">
          <textarea
            name="supervisorComments"
            value={formData.supervisorComments}
            onChange={handleChange}
            placeholder=" "
            readOnly
          />
          <label>Supervisor Comments</label>
          <div className="textarea-count">
            {formData.supervisorComments.length}/300
          </div>
        </div>

        {!readOnly && (
          <button type="submit" className="submit-button">
            Submit Report
          </button>
        )}
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default WeeklyProgressReportForm;
