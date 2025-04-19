import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css"; // Make sure you create this CSS

const StudentDashboard = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("ipmsUser"));
    const backendUrl = process.env.REACT_APP_API_URL;
    const ouEmail = user?.email;
    const [approvalStatus, setApprovalStatus] = useState(false)
    

    useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await fetch(`${backendUrl}/api/student`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ouEmail }),
            });
      
            const data = await res.json();
            setApprovalStatus(data.approvalStatus);
            
          } catch (err) {
            console.error("Error fetching internship data", err);
          }
        };
      
        if (ouEmail) {
          fetchData();
        }
      }, [ouEmail]);
      




  return (
    <div className="student-dashboard">
  <div className="dashboard-header">
    <h2>Welcome, {user.fullName}</h2>
  </div>

  <div className="dashboard-card">
  <div className="card-section">
  <div className="card-content">
    <h3>Request Internship (FORM A1)</h3>
    <p>Track your internship journey</p>
  </div>
  <button
    className="card-button"
    onClick={() => {
      if (!approvalStatus) {
        navigate("/a1-form");
      }
    }}
    style={{
      backgroundColor: approvalStatus ? "#4CAF50" : "",
      cursor: approvalStatus ? "default" : "pointer",
    }}
  >
    {approvalStatus ? "Track" : "Request Internship"}
  </button>
</div>

    <div className="card-section">
      <div className="card-content">
        <h3>Weekly Report (Form A2)</h3>
        {!approvalStatus && (
          <p style={{ fontSize: "0.85rem", color: "#888" }}>
            Finish your Form A1 first
          </p>
        )}
      </div>
      <button
        className="card-button"
        disabled={!approvalStatus}
        style={{
          backgroundColor: !approvalStatus ? "#ccc" : "",
          cursor: !approvalStatus ? "not-allowed" : "pointer",
        }}
      >
        Request
      </button>
    </div>
  </div>
</div>

  );
};

export default StudentDashboard;
