import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";

const API_URL = process.env.REACT_APP_API_URL;

function CoordinatorDashboard() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/coordinator/requests`
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (_id) => {
    try {
      const res = await fetch(`${API_URL}/api/coordinator/requests/${_id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      alert(result.message);
      fetchRequests();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving request.");
    }
  };

  const handleReject = async (_id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const res = await fetch(`${API_URL}/api/coordinator/requests/${_id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const result = await res.json();
      alert(result.message);
      fetchRequests();
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting request.");
    }
  };

  const daysRemaining = (expiresAt) => {
    const now = new Date();
    const due = new Date(expiresAt);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Coordinator Dashboard</h2>

      {requests.length === 0 ? (
        <p>No Pending Requests</p>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="request-card"
            onClick={() => navigate(`/coordinator/request/${req._id}`)}
          >
            <h4>{req.student.userName}</h4>
            <p>Email: {req.student.email}</p>
            <p>Company: {req.workplace.name}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default CoordinatorDashboard;
