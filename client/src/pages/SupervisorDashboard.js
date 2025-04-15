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

  // 🚀 Fetch Pending Submissions
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/submissions/pending`);
        setRequests(res.data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setMessage("Failed to fetch pending approvals.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // 📦 Fetch 4-week Cumulative Reports
  useEffect(() => {
    const fetchCumulativeReports = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cumulative/reports`);
        setCumulativeReports(res.data?.cumulativeReports || []);
      } catch (err) {
        console.error("Error fetching cumulative reports:", err);
      }
    };

    fetchCumulativeReports();
  }, []);

  // ✅ Handle Supervisor Approval/Reject
  const handleAction = async (id, action, comment) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/submissions/${id}/${action}`,
        { comment }
      );
      setMessage(res.data.message || `${action} successful`);
      setRequests(prev => prev.filter(req => req._id !== id));
      setSelectedForm(null);
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      setMessage(`Failed to ${action} request.`);
    }
  };

  // 📅 Format Date Strings
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>
      {message && <p className="status-msg">{message}</p>}

      {/* ✅ Pending Approvals Table */}
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
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
                <td>
                  <button
                    className="link-button"
                    onClick={() => setSelectedForm(req)}
                  >
                    {req.student_id}
                  </button>
                </td>
                <td>{req.form_type}</td>
                <td>{formatDate(req.createdAt)}</td>
                <td>
                  <span className={`status-badge ${req.supervisor_status}`}>
                    {req.supervisor_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 📋 Cumulative Report Section */}
      <h3 style={{ marginTop: "40px" }}>Cumulative Reports (Every 4 Weeks)</h3>

      {cumulativeReports.length === 0 ? (
        <p>No Cumulative Reports Found.</p>
      ) : (
        cumulativeReports.map((group, index) => (
          <div key={index} className="cumulative-report-card">
            <h4>Weeks: {group.weeks?.join(", ")}</h4>
            <ul>
              {group.reports.map((rep, idx) => (
                <li key={idx}>
                  Week {rep.week} — Hours: {rep.hours} — Tasks: {rep.tasks}
                </li>
              ))}
            </ul>
            <button
              className="review-button"
              onClick={() => navigate(`/review-cumulative/${group.groupIndex}`)}
            >
              Review & Comment
            </button>
          </div>
        ))
      )}

      {/* 📄 View Modal for Pending Form */}
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
