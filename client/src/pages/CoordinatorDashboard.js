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
            {/* <h4>{req.student.userName}</h4>
            <p>Email: {req.student.email}</p> */}
            <p>Company: {req.workplace.name}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default CoordinatorDashboard;
