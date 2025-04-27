import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "../styles/WeeklyProgressReportForm.css";

const WeeklyProgressReportForm = ({ role = "student", readOnly = false }) => {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    supervisorName: "",
    supervisorEmail: "",
    coordinatorName: "Naveena",
    coordinatorEmail: "naveena.suddapalli-1@ou.edu",
    creditHours: "",
    completedHours: 0,
    requiredHours: 0,
    week: "",
    hours: "",
    tasks: "",
    lessons: "",
    supervisorComments: "",
    coordinatorComments: "",
  });

  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState(null);

  // Fetch A1 Form + Weekly Reports
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = "vikash.balaji.kokku-1@ou.edu"; // TODO: make dynamic later
        
        // Fetch A1 Form
        const a1Res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/a1/${email}`);
        if (a1Res.data.success) {
          const { name, email: userEmail, supervisorName, supervisorEmail, creditHours, startDate: fetchedStartDate } = a1Res.data.form;
          
          setFormData(prev => ({
            ...prev,
            name,
            email: userEmail,
            supervisorName,
            supervisorEmail,
            creditHours,
            requiredHours: creditHours ? creditHours * 60 : 0,
          }));

          setStartDate(fetchedStartDate);
        }

        // Fetch Weekly Reports to calculate completed hours
        const reportsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/mine?email=${email}`);
        if (reportsRes.data.success) {
          setFormData(prev => ({
            ...prev,
            completedHours: reportsRes.data.completedHours || 0,
          }));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setMessage("⚠️ Please ensure you have submitted A1 form.");
      }
    };

    if (!readOnly) fetchData();
  }, [readOnly]);

  // Load a single report if readonly mode
  useEffect(() => {
    if (readOnly && reportId) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/reports/${reportId}`)
        .then(res => {
          if (res.data.success) {
            setFormData(prev => ({
              ...prev,
              ...res.data.report,
            }));
          }
        })
        .catch(err => console.error("Failed to load report", err));
    }
  }, [readOnly, reportId]);

  // Auto-calculate current week
  useEffect(() => {
    if (startDate && !readOnly) {
      const today = dayjs();
      const start = dayjs(startDate);
      const diffInDays = today.diff(start, "day");

      if (diffInDays >= 0) {
        const weekNumber = Math.floor(diffInDays / 7) + 1;
        setFormData(prev => ({
          ...prev,
          week: `Week ${Math.min(weekNumber, 15)}`,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          week: "Week 1",
        }));
      }
    }
  }, [startDate, readOnly]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (readOnly && !(role === "coordinator" && name === "coordinatorComments")) return;

    if (name === "hours") {
      const num = parseInt(value, 10);
      if (num > 40) return setFormData(prev => ({ ...prev, hours: 40 }));
      if (num < 1 && value !== "") return setFormData(prev => ({ ...prev, hours: 1 }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { week, hours, tasks, lessons, name, email, supervisorName, supervisorEmail } = formData;

    if (!name || !email || !supervisorName || !supervisorEmail) {
      return setMessage("Please complete the A1 form first.");
    }

    if (!week || !hours || !tasks || !lessons) {
      return setMessage("Please fill in all the required fields.");
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports`, formData);
      setMessage(res.data.message || "Report submitted successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage("Submission failed. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      supervisorName: "",
      supervisorEmail: "",
      coordinatorName: "Naveena",
      coordinatorEmail: "naveena.suddapalli-1@ou.edu",
      creditHours: "",
      completedHours: 0,
      requiredHours: 0,
      week: "",
      hours: "",
      tasks: "",
      lessons: "",
      supervisorComments: "",
      coordinatorComments: "",
    });
  };

  const handleCoordinatorSubmit = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/reports/${reportId}/coordinator-comment`,
        { coordinatorComments: formData.coordinatorComments }
      );
      setMessage(res.data.message || "Coordinator comment submitted!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit coordinator comment.");
    }
  };

  return (
    <div className="a2-form-container">
      <h2>Weekly Progress Report</h2>

      <button className="view-submissions-btn" onClick={() => navigate("/submitted-reports")}>
        View Previous Submissions
      </button>

      <form onSubmit={handleSubmit} className="a2-form">
        {/* Identity Fields */}
        {["name", "email", "supervisorName", "supervisorEmail", "coordinatorName", "coordinatorEmail"].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.replace(/([A-Z])/g, " $1").replace("Email", "Email*").replace("Name", "Name*")}</label>
            <input
              type={field.includes("Email") ? "email" : "text"}
              name={field}
              value={formData[field]}
              readOnly
              required
            />
          </div>
        ))}

        {/* Progress Info */}
        {!readOnly && (
          <div className="form-group progress-info">
            <p><strong>Credit Hours:</strong> {formData.creditHours || "--"}</p>
            <p><strong>Required Hours:</strong> {formData.requiredHours || "--"}</p>
            <p><strong>Completed Hours:</strong> {formData.completedHours || "--"}</p>
            {formData.requiredHours && (
              <>
                <p><strong>Progress:</strong> {Math.min(100, Math.round((formData.completedHours / formData.requiredHours) * 100))}%</p>
                <div className="progress-bar-outer">
                  <div
                    className="progress-bar-inner"
                    style={{ width: `${Math.min(100, Math.round((formData.completedHours / formData.requiredHours) * 100))}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        )}

        <hr className="section-divider" />

        {/* Week & Hours */}
        <div className="week-hours-row">
          <div className="form-group">
            <label>Week</label>
            <select
              name="week"
              value={formData.week || ""}
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

        {/* Tasks and Lessons */}
        {["tasks", "lessons"].map((field) => (
          <div className="form-group floating-label-group" key={field}>
            <textarea
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder=" "
              required
              readOnly={readOnly}
            />
            <label>{field === "tasks" ? "Tasks Performed" : "Lessons Learned"}</label>
            <div className="textarea-count">{formData[field].length}/300</div>
          </div>
        ))}

        {/* Comments */}
        {["supervisorComments", "coordinatorComments"].map((field) => (
          <div className="form-group floating-label-group" key={field}>
            <textarea
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder=" "
              readOnly={field === "supervisorComments" || !(readOnly && role === "coordinator")}
            />
            <label>{field === "supervisorComments" ? "Supervisor Comments" : "Coordinator Comments"}</label>
            <div className="textarea-count">{formData[field].length}/300</div>
          </div>
        ))}

        {/* Submit Buttons */}
        {readOnly && role === "coordinator" && (
          <button type="button" className="submit-button" onClick={handleCoordinatorSubmit}>
            Submit Coordinator Comment
          </button>
        )}

        {!readOnly && (
          <button type="submit" className="submit-button">
            Submit Report
          </button>
        )}
      </form>

      {message && <p className={`form-message ${message.includes("⚠️") ? "error" : ""}`}>{message}</p>}
    </div>
  );
};

export default WeeklyProgressReportForm;
