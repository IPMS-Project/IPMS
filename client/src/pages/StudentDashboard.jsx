import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css"; // Make sure you create this CSS

const StudentDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("ipmsUser"));
  const ouEmail = user?.email;
  const [approvalStatus, setApprovalStatus] = useState("not_submitted");
  const [a3Eligibility, setA3Eligibility] = useState({
    checked: false,
    eligible: false,
    completedHours: 0,
    requiredHours: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/student`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ouEmail }),
          }
        );

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

  useEffect(() => {
    const checkA3Eligibility = async () => {
      if (!ouEmail) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reports/A3-eligibility`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: ouEmail }),
          }
        );
        const data = await res.json();
        setA3Eligibility({
          checked: true,
          eligible: data.eligibleForA3,
          completedHours: data.completedHours,
          requiredHours: data.requiredHours,
        });
      } catch (err) {
        setA3Eligibility({
          checked: true,
          eligible: false,
          completedHours: 0,
          requiredHours: 0,
        });
        console.error("Error checking A3 eligibility", err);
      }
    };
    checkA3Eligibility();
  }, [ouEmail]);

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

        {/* ------ FORM A3 Card ------ */}
        <div className="card-section">
          <div className="card-content">
            <h3>Final Evaluation (Form A3)</h3>
            {!a3Eligibility.checked ? (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                Checking eligibility...
              </p>
            ) : a3Eligibility.eligible ? (
              <p style={{ fontSize: "0.85rem", color: "green" }}>
                You have completed {a3Eligibility.completedHours} of{" "}
                {a3Eligibility.requiredHours} hours. Eligible for final
                evaluation.
              </p>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                You have completed {a3Eligibility.completedHours} of{" "}
                {a3Eligibility.requiredHours} hours.
                <br />
                Complete all required hours to unlock A3 Final Evaluation.
              </p>
            )}
          </div>
          <button
            className="card-button"
            disabled={!a3Eligibility.eligible}
            onClick={() => {
              if (a3Eligibility.eligible) navigate("/evaluation");
            }}
            style={{
              backgroundColor: !a3Eligibility.eligible ? "#ccc" : "",
              cursor: !a3Eligibility.eligible ? "not-allowed" : "pointer",
            }}
          >
            {a3Eligibility.eligible ? "Open Final Evaluation" : "Locked"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
