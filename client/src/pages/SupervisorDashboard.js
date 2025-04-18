import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

    useEffect(() => {

      // Token used for authentification for future
      // Now it will only be empty
      const token = localStorage.getItem("token") || ""; 
      
      const fetchRequests = async () => {
      try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/supervisor/forms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const formatted = res.data
                               .map(item => ({
            _id: item._id,
            name: item.student?.userName || item.student?.name || "N/A",
            student_id: item.student?._id || item._id,
            form_type: item.form_type,
            createdAt: item.createdAt,
            supervisor_status: item.supervisor_status || "pending",
            fullForm: item
          }))

        setRequests(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Internship A1 forms:", err);
        setMessage("Error fetching Internship A1 forms.", err);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

    const handleAction = async (id, form_type, action, comment) => {

        const token = localStorage.getItem("token");
        
        const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
        if (!confirmed) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/supervisor/form/${form_type}/${id}/${action}`,
          { comment },
          {
            headers: {
                Authorization: `Bearer" ${token}`,
            },
          }
      );

        setMessage(res.data.message || `${action} successful`);
      setRequests(prev => prev.filter(req => req._id !== id));
      setSelectedForm(null);
      setHighlightedRowId(null);
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      setMessage(`Failed to ${action} request.`);
    }
  };

  const openFormView = (form) => {
    setSelectedForm(form);
    setHighlightedRowId(form._id);
  };

  const closeFormView = () => {
    setSelectedForm(null);
    setHighlightedRowId(null);
  };

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
              <tr
                key={req._id}
                onClick={() => openFormView(req.fullForm)}
                className={highlightedRowId === req._id ? "selected" : ""}
              >
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
