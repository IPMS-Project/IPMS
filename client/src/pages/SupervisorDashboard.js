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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/form/internshiprequests`);
        console.log("Fetched internship requests:", res.data); // debug log

        const formatted = res.data
          .map(item => ({
            _id: item._id,
            name: item.student?.userName || item.student?.name || "N/A",
            student_id: item.student?._id || item._id,

            form_type: "A1",
            createdAt: item.createdAt,
            supervisor_status: item.supervisor_status || "pending",
            fullForm: item
          }))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first

        setRequests(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Internship A1 forms:", err);
        setMessage("Error fetching Internship A1 forms.");
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
        `${process.env.REACT_APP_API_URL}/api/form/internshiprequests/${id}/${action}`,
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

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>
      {message && <p className="status-msg">{message}</p>}

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
                  <button className="link-button" onClick={() => openFormView(req.fullForm)}>
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
