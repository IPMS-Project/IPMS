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

  const approveForm = async (formId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/approval/form/${formId}/approve`
      );
      alert("Form approved successfully!");
      fetchRequests(); // refresh the list after approving
    } catch (err) {
      console.error("Failed to approve form:", err);
      alert("Failed to approve form!");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Coordinator Dashboard</h2>

      {requests.length === 0 ? (
        <p>No Pending Requests</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="request-card">
            <p>Company: {req.workplace.name}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-approve"
                onClick={() => approveForm(req._id)}
              >
                Approve
              </button>
              <button
                className="btn-view"
                onClick={() => navigate(`/coordinator/request/${req._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CoordinatorDashboard;
