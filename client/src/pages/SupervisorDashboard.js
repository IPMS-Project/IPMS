import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/supervisor/forms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formatted = res.data.map((item) => ({
        _id: item._id,
        name: item.student?.userName || item.student?.name || "N/A",
        student_id: item.student?._id || item._id,
        form_type: item.form_type || "A.1",
        createdAt: item.createdAt,
        supervisor_status: item.supervisor_status || "pending",
        fullForm: item,
      }));

      setRequests(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Internship A1 forms:", err);
      setMessage("Error fetching Internship A1 forms.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFormActionComplete = () => {
    fetchRequests(); // Refresh table after Approve/Reject
    setSelectedForm(null);
  };

  const handleAction = async (id, form_type, action, comment) => {
    const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
    if (!confirmed) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/supervisor/form/${form_type}/${id}/${action}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || `${action} successful`);
      setRequests((prev) => prev.filter((req) => req._id !== id));
      setSelectedForm(null);
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      setMessage(`Failed to ${action} request.`);
    }
  };

  const openFormView = (form) => setSelectedForm(form);
  const closeFormView = () => setSelectedForm(null);

  const formatDate = (date) => new Date(date).toLocaleDateString();

  let content;

  if (loading) {
    content = <p>Loading...</p>;
  } else if (requests.length === 0) {
    content = (
      <div className="empty-message-container">
        <div className="empty-message">No pending approvals.</div>
      </div>
    );
  } else {
    content = (
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
            <tr key={req._id} className="clickable-row" onClick={() => openFormView(req.fullForm)}>
              <td>{req.name}</td>
              <td>{req.student_id}</td>
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
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>
      {message && <p className="status-msg">{message}</p>}
      {content}
      {selectedForm && (
        <ViewFormModal
          formData={selectedForm}
          onClose={closeFormView}
          onAction={handleAction}
          onActionComplete={handleFormActionComplete}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
