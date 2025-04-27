import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import ViewFormModal from "./ViewFormModal";

const SupervisorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token") || "";

  const email = "vikash.balaji.kokku-1@ou.edu"; // TODO: Replace with dynamic user email later

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const formRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/supervisor/forms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedForms = formRes.data.map(item => ({
          _id: item._id,
          interneeName: item.student?.fullName || item.studentId?.fullName || item.interneeId?.fullName || "N/A",
          interneeEmail: item.student?.ouEmail || item.studentId?.ouEmail || item.interneeId?.ouEmail || "N/A",
          form_type: item.form_type,
          createdAt: item.createdAt || item.submittedAt,
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

        setRequests(formattedForms);

        // Fetch weekly cumulative reports pending supervisor review
        const weeklyRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cumulative`, {
          params: { email },
        });
        setWeeklyReports(weeklyRes.data.cumulativeReports || []);

        setLoading(false);
      } catch (err) {
        console.error(err);
        if (err.response) {
          if (err.response.status === 401) {
            setMessage("Unauthorized. Redirecting to login...");
            localStorage.removeItem("token");
            window.location.href = "/";
          } else if (err.response.status === 403) {
            setMessage("Forbidden access. Redirecting...");
            window.location.href = "/";
          } else if (err.response.status === 500) {
            setMessage("Server error. Please try again later.");
          } else {
            setMessage("Unexpected error. Try again.");
          }
        }
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  const handleAction = async (id, form_type, action, comment, signature) => {
    const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
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
      setRequests(prev => prev.filter(req => req._id !== id));
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
    .filter(res => res.supervisor_status?.toLowerCase() === "pending")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="dashboard-container">
      <h2>Supervisor Dashboard</h2>
      {message && <p className="status-msg">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Regular Form Approvals */}
          {sortedRequests.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
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
                      <button className="link-button" onClick={() => openFormView(req)}>
                        {req.interneeEmail}
                      </button>
                    </td>
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
          ) : (
            <div className="empty-message-container">
              <div className="empty-message">No pending form approvals.</div>
            </div>
          )}

          {/* Cumulative Weekly Reports Pending Supervisor Review */}
          {weeklyReports.length > 0 && (
            <div className="weekly-review-section">
              <h3>Pending Weekly Group Reviews</h3>
              {weeklyReports.map((group, idx) => (
                <div key={idx} className="weekly-group-card">
                  <p><strong>Weeks:</strong> {group.weeks.join(", ")}</p>
                  <button
                    className="review-btn"
                    onClick={() => window.location.href = `/review-cumulative/${group.groupIndex}`}
                  >
                    Review Group
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form View Modal */}
      {selectedForm && (
        <ViewFormModal
          formData={selectedForm}
          onClose={closeFormView}
          onAction={(id, action, comment, signature) =>
            handleAction(id, selectedForm.form_type, action, comment, signature)
          }
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
