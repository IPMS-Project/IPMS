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

      // Token used for authentication for future
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

          const formatted = res.data.map(item => ({
            _id: item._id,
            name: item.student?.userName || item.student?.name || "N/A",
            student_id: item.student?._id || item._id,
            form_type: item.form_type,
            createdAt: item.createdAt,
            fullForm: item,
            workplace: {
                name: item.workplace?.name || "N/A",
                website: item.workplace?.website || "N/A",
                phone: item.workplace?.phone || "N/A",
            },
            internshipAdvisor: {
                name: item.internshipAdvisor?.name || "N/A",
                jobTitle: item.internshipAdvisor?.jobTitle || "N/A",
                email: item.internshipAdvisor?.email || "N/A",
            },
            creditHours: item.creditHours || 0,
            startDate: item.startDate || "N/A",
            endDate: item.endDate || "N/A",
            tasks: item.tasks || [],
            status: item.status || "pending",
            supervisor_comment: item.supervisor_comment || "N/A"
        }));
        

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
                Authorization: `Bearer ${token}`,
            },
          }
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
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;