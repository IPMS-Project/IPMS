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

        fetchRequests();
    }, []);

    
    const fetchRequests = async () => {
        // Token used for authentication for future
        // Now it will only be empty
        const token = localStorage.getItem("token") || ""; 
        
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/supervisor/forms`,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
            );

            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching forms:", err);
            setMessage("Error fetching forms.", err);
            setLoading(false);
        }
    };

    const handleAction = async (formType, id, action, comment, signature) => {
        const token = localStorage.getItem("token") || "";
        
        const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
        if (!confirmed) return false;
  
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/supervisor/form/${formType}/${id}/${action}`,
                { comment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
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
              <th>Sooner ID</th>
              <th>Email</th>
              <th>Form Type</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
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
