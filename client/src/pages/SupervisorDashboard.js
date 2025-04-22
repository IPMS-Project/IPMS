import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const [requests, setRequests] = useState([]);
  // const [cumulativeReports, setCumulativeReports] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/supervisor/forms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formatted = res.data.map((item) => ({
          _id: item._id,
          interneeName: item.interneeName || item.student_id?.userName || "N/A",
          soonerId: item.soonerId || item.student_id?.soonerId || "N/A",
          interneeEmail: item.interneeEmail || item.student_id?.email || "N/A",
          form_type: item.form_type,
          createdAt: item.createdAt,
          supervisor_status: item.supervisor_status || "pending",
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
          supervisor_comment: item.supervisor_comment || "N/A",
        }));

        setRequests(formatted);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setMessage("Error fetching forms.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (form_type, id, action, comment, signature) => {
    const token = localStorage.getItem("token");

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this request?`
    );
    if (!confirmed) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/supervisor/form/${form_type}/${id}/${action}`,
        { comment, signature },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || `${action} successful`);
      setRequests((prev) => prev.filter((req) => req._id !== id));
      return true;
    } catch (err) {
      console.error(err);
      setMessage(`Failed to ${action} request.`);
      return false;
    }
  };

  const openFormView = (form) => setSelectedForm(form);
  const closeFormView = () => setSelectedForm(null);
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const sortedRequests = [...requests]
    .filter((res) => res.supervisor_status?.toLowerCase() === "pending")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  let content;

  if (loading) {
    content = <p>Loading...</p>;
  } else if (sortedRequests.length === 0) {
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
            <th>Sooner ID</th>
            <th>Student Email</th>
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
                <button
                  className="link-button"
                  onClick={() => openFormView(req)}
                >
                  {req.soonerId}
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
          onAction={(id, action, comment, signature) =>
            handleAction(selectedForm.form_type, id, action, comment, signature)
          }
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
