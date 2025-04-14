import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";

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
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/coordinator/request/${_id}/approve`
      );
      alert(res.data.message);
      fetchRequests();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving request.");
    }
  };

  const handleReject = async (_id) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return alert("Rejection reason required!");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/coordinator/request/${_id}/reject`,
        { reason }
      );
      alert(res.data.message);
      fetchRequests();
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting request.");
    }
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
            <div className="action-buttons">
              <button
                className="approve-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(req._id);
                }}
              >
                Approve
              </button>

              <button
                className="reject-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(req._id);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CoordinatorDashboard;
