// SupervisorDashboard.js
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

  const email = "vikash.balaji.kokku-1@ou.edu"; // Replace with dynamic user email later

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const formRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/supervisor/forms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedForms = formRes.data.map(item => ({
          _id: item._id,
          interneeName: item.student?.fullName || "N/A",
          interneeEmail: item.student?.ouEmail || "N/A",
          form_type: item.form_type,
          createdAt: item.createdAt || item.submittedAt,
          supervisor_status: item.supervisor_status || "pending",
          fullForm: item,
        }));

        setRequests(formattedForms);

        const weeklyRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cumulative`, {
          params: { email },
        });
        setWeeklyReports(weeklyRes.data.cumulativeReports || []);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

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

          {weeklyReports.length > 0 && (
            <div className="weekly-review-section">
              <h3>Pending Weekly Group Reviews</h3>
              {weeklyReports.map((group, idx) => (
                <div key={idx} className="weekly-group-card">
                  <p><strong>Weeks:</strong> {group.weeks.map(w => w.replace('Week ', '')).join(", ")}</p>
                  <button
                    className="review-btn"
                    onClick={() => window.location.href = `/review-cumulative/${group.groupIndex}?email=${encodeURIComponent(email)}`}
                  >
                    Review Group
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedForm && (
        <ViewFormModal
          formData={selectedForm}
          onClose={closeFormView}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
