import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/supervisor/forms`);
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setMessage("Error fetching requests.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (formType, id, action, comment, signature) => {
    const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
    if (!confirmed) return false;
  
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/supervisor/form/${formType}/${id}/${action}`,
        { comment, signature }
      );
      setMessage(res.data.message || `${action} successful`);
      setRequests(prev => prev.filter(req => req._id !== id)); // remove from table
      return true;
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      setMessage(`Failed to ${action} request.`);
      return false;
    }
  };
  

  const openFormView = (form) => setSelectedForm(form);
  const closeFormView = () => setSelectedForm(null);
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const sortedRequests = [...requests]
    .filter((req) => req.supervisor_status?.toLowerCase() === "pending")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>
      {message && <p className="status-msg">{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : sortedRequests.length === 0 ? (
        <div className="empty-message-container">
          <div className="empty-message">No pending approvals.</div>
        </div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Sooner ID</th>
              <th>Email</th>
              <th>Form Type</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((req) => (
              <tr key={req._id}>
                <td>{req.interneeName || req.studentName}</td>
                <td>
                  <button className="link-button" onClick={() => openFormView(req)}>
                    {req.interneeID || req.soonerId}
                  </button>
                </td>
                <td>{req.interneeEmail || req.studentEmail}</td>
                <td>{req.form_type}</td>
                <td>{formatDate(req.createdAt)}</td>
                <td>
                  <span className={`status-badge ${req.supervisor_status || req.status}`}>
                    {req.supervisor_status || req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedForm && (
        <ViewFormModal
          formData={selectedForm}
          onClose={closeFormView}
          onAction={(id, action, comment, signature) =>
            handleAction(selectedForm.form_type, id, action, comment, signature)
          }
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
