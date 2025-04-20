import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/evaluation`);
        setRequests(res.data);
        setLoading(false);
      } catch (err) {
        console.error("AXIOS ERROR:", err.response?.data || err.message);
        setMessage("Error fetching requests.");
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (id, action, comment) => {
    const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
    if (!confirmed) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/evaluation/${id}/${action}`,
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

  const openFormView = (form) => setSelectedForm(form);
  const closeFormView = () => setSelectedForm(null);
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>
      {message && <p className="status-msg">{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : sortedRequests.length === 0 ? (
        <div className="empty-message-container">
          <div className="empty-message">No A3 forms available.</div>
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
                <td>{req.interneeName}</td>
                <td>
                  <button className="link-button" onClick={() => openFormView(req)}>
                    {req.interneeID}
                  </button>
                </td>
                <td>{req.interneeEmail}</td>
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

      {selectedForm && (
        <ViewFormModal
          formData={selectedForm}
          onClose={closeFormView}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;