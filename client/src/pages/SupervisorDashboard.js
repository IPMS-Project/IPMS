import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [cumulativeReports, setCumulativeReports] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/submissions/pending`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cumulative/reports`)
        ]);
        setRequests(res1.data || []);
        setCumulativeReports(res2.data?.cumulativeReports || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (id, action, comment) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/submissions/${id}/${action}`, { comment });
      setMessage(res.data.message || `${action} successful`);
      setRequests(prev => prev.filter(req => req._id !== id));
      setSelectedForm(null);
    } catch (err) {
      console.error(err);
      setMessage(`Failed to ${action} request.`);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>

      {message && <p className="status-msg">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Pending Approvals */}
          <h3 className="section-heading">Pending Approvals</h3>
          {requests.length === 0 ? (
            <div className="empty-message-container">
              <div className="empty-message">No pending approvals.</div>
            </div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Form Type</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.name}</td>
                    <td><button className="link-button" onClick={() => setSelectedForm(req)}>{req.student_id}</button></td>
                    <td>{req.form_type}</td>
                    <td>{formatDate(req.createdAt)}</td>
                    <td><span className={`status-badge ${req.supervisor_status}`}>{req.supervisor_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Cumulative Reports */}
          <h3 className="section-heading">Cumulative Reports</h3>
          {cumulativeReports.length === 0 ? (
            <p>No Cumulative Reports Found.</p>
          ) : (
            cumulativeReports.map((group, index) => (
              <div key={index} className="cumulative-report-card">
                <h4 className="weeks-covered">Weeks Covered: {group.weeks?.map(week => week.replace("Week ", "")).join(", ")}</h4>
                <ul className="week-report-grid">
                  {group.reports.map((rep, idx) => (
                    <li key={idx} className="week-report-item">
                      <span>Week {rep.week.replace("Week ", "")}</span>
                      <strong>Hours: {rep.hours}</strong>
                      <strong>Tasks: {rep.tasks}</strong>
                    </li>
                  ))}
                </ul>
                <button className="review-button red-btn" onClick={() => navigate(`/review-cumulative/${group.groupIndex}`)}>Review & Comment</button>
              </div>
            ))
          )}
        </>
      )}

      {selectedForm && (
        <ViewFormModal
          formData={selectedForm}
          onClose={() => setSelectedForm(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;