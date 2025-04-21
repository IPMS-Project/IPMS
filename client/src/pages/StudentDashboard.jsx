import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css"; // Make sure you create this CSS

const StudentDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("ipmsUser"));
  const ouEmail = user?.email;
  const [approvalStatus, setApprovalStatus] = useState("not_submitted");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/student`, {
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
  console.log(approvalStatus);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.fullName}</h2>
      </div>

      <div className="dashboard-card">
        {/* ------ FORM A1 Card ------ */}
        <div className="card-section">
          <div className="card-content">
            <h3>Request Internship (FORM A1)</h3>
            <p>Track your internship journey</p>

            {approvalStatus === "not_submitted" && (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                You have not submitted the form yet
              </p>
            )}

            {(approvalStatus === "submitted" ||
              approvalStatus === "pending manual review") && (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                Your form is submitted and under review
              </p>
            )}

            {approvalStatus === "approved" && (
              <p style={{ fontSize: "0.85rem", color: "green" }}>Approved</p>
            )}
          </div>

          <button
            className="card-button"
            onClick={() => {
              if (
                approvalStatus === "draft" ||
                approvalStatus === "not_submitted"
              ) {
                navigate("/a1-form");
              }
            }}
            disabled={
              approvalStatus !== "draft" && approvalStatus !== "not_submitted"
            }
            style={{
              backgroundColor:
                approvalStatus !== "draft" && approvalStatus !== "not_submitted"
                  ? "#ccc"
                  : "",
              cursor:
                approvalStatus !== "draft" && approvalStatus !== "not_submitted"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {approvalStatus === "approved" ? "Track" : "Request Internship"}
          </button>
        </div>

        {/* ------ FORM A2 Card ------ */}
        <div className="card-section">
          <div className="card-content">
            <h3>Weekly Report (Form A2)</h3>

            {approvalStatus === "not_submitted" && (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                Please fill your Form A1 first
              </p>
            )}

            {approvalStatus === "draft" && (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                Finish your Form A1 first
              </p>
            )}

            {(approvalStatus === "submitted" ||
              approvalStatus === "pending manual review") && (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                Wait for your Form A1 to be approved
              </p>
            )}
          </div>

          <button
            className="card-button"
            disabled={approvalStatus !== "approved"}
            onClick={() => {
              if (approvalStatus === "approved") {
                navigate("/weekly-report");
              }
            }}
            style={{
              backgroundColor: approvalStatus !== "approved" ? "#ccc" : "",
              cursor: approvalStatus !== "approved" ? "not-allowed" : "pointer",
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
