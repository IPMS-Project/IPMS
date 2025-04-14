import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";

function CoordinatorDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/coordinator/requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (_id) => {
    try {
      const res = await fetch(`/api/coordinator/requests/${_id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      alert(result.message);
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving request.");
    }
  };

  const handleReject = async (_id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const res = await fetch(`/api/coordinator/requests/${_id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const result = await res.json();
      alert(result.message);
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting request.");
    }
  };

  // 🔢 Calculate remaining days until expiration
  const daysRemaining = (expiresAt) => {
    const now = new Date();
    const due = new Date(expiresAt);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="dashboard-container">
      <h2>Coordinator Dashboard</h2>
      <p>Review and manage internship requests.</p>

      <div className="request-list">
        {requests.map((req) => (
          <div key={req._id} className="request-card">
            <h4>{req.fullName}</h4>
            <p>
              <strong>Email:</strong> {req.ouEmail}
            </p>
            <p>
              <strong>Advisor:</strong> {req.academicAdvisor}
            </p>
            <p>
              <strong>Status:</strong> {req.status}
            </p>
            <p>
              <strong>Requested At:</strong>{" "}
              {new Date(req.requestedAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Expires In:</strong>
              <span
                style={{
                  color: daysRemaining(req.expiresAt) <= 5 ? "red" : "green",
                  fontWeight: "bold",
                  marginLeft: "6px",
                }}
              >
                {daysRemaining(req.expiresAt)} days
              </span>
            </p>

            <div className="action-buttons">
              <button
                className="approve-btn"
                onClick={() => handleApprove(req._id)}
              >
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(req._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoordinatorDashboard;
