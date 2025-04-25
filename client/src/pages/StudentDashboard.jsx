import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ipmsUser"));
  const backendUrl = process.env.REACT_APP_API_URL;
  const ouEmail = user?.email;

  const [approvalStatus, setApprovalStatus] = useState("not_submitted");
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
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
        console.error("Error fetching approval status", err);
      }
    };

    if (ouEmail) fetchStatus();
  }, [ouEmail, backendUrl]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/form/pending-requests`);
        const data = await res.json();
        const studentSubmissions = data.filter(
          (req) =>
            req?.student?.email?.toLowerCase().trim() ===
            user.email.toLowerCase().trim()
        );
        setSubmissions(studentSubmissions);
      } catch (err) {
        console.error("Error fetching submissions", err);
        setError("Unable to load your submissions right now.");
      }
    };

    if (user?.email) fetchSubmissions();
  }, [backendUrl, user?.email]);

  const handleResend = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/form/requests/${id}/resend`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message);
    } catch {
      alert("Failed to resend request.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this request?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${backendUrl}/api/form/requests/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);
      setSubmissions((prev) => prev.filter((sub) => sub._id !== id));
    } catch {
      alert("Failed to delete request.");
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.fullName}</h2>
      </div>

      <div className="dashboard-card">
        {/* FORM A1 */}
        <div className="card-section">
          <div className="card-content">
            <h3>Request Internship (FORM A1)</h3>
            <p>Track your internship journey</p>
            {approvalStatus === "not_submitted" && (
              <p className="info-msg">You have not submitted the form yet</p>
            )}
            {(approvalStatus === "submitted" ||
              approvalStatus === "pending manual review") && (
              <p className="info-msg">Your form is under review</p>
            )}
            {approvalStatus === "approved" && (
              <p className="success-msg">Approved</p>
            )}
          </div>
          <button
            className="card-button"
            onClick={() =>
              ["draft", "not_submitted"].includes(approvalStatus) &&
              navigate("/a1-form")
            }
            disabled={
              !["draft", "not_submitted"].includes(approvalStatus)
            }
            style={{
              backgroundColor: ["draft", "not_submitted"].includes(
                approvalStatus
              )
                ? ""
                : "#ccc",
              cursor: ["draft", "not_submitted"].includes(approvalStatus)
                ? "pointer"
                : "not-allowed",
            }}
          >
            {approvalStatus === "approved" ? "Track" : "Request Internship"}
          </button>
        </div>

        {/* FORM A2 */}
        <div className="card-section">
          <div className="card-content">
            <h3>Weekly Report (FORM A2)</h3>
            {approvalStatus !== "approved" && (
              <p className="info-msg">Finish Form A1 & get approved first</p>
            )}
          </div>
          <button
            className="card-button"
            disabled={approvalStatus !== "approved"}
            onClick={() => approvalStatus === "approved" && navigate("/weekly-report")}
            style={{
              backgroundColor: approvalStatus === "approved" ? "" : "#ccc",
              cursor: approvalStatus === "approved" ? "pointer" : "not-allowed",
            }}
          >
            Request
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="dashboard-table">
        <h2>Your Internship Submissions</h2>
        {error && <div className="error-message">{error}</div>}
        <table className="submission-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Status</th>
              <th>Submitted On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((req) => (
              <tr key={req._id}>
                <td>{req.workplace.name}</td>
                <td>{req.status}</td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  {req.reminders?.length === 2 && !req.coordinatorResponded ? (
                    <>
                      <button
                        className="btn-warning"
                        onClick={() => handleResend(req._id)}
                      >
                        Resend
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(req._id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span>Waiting</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;
