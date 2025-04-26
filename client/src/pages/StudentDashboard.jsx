import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ipmsUser"));
  const ouEmail = user?.email;
  const backendUrl = process.env.REACT_APP_API_URL;
  const studentId = localStorage.getItem("studentId");

  const [approvalStatus, setApprovalStatus] = useState("not_submitted");
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    
    const fetchA1Status = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ouEmail: user?.email }),
        });
        const data = await res.json();
        setApprovalStatus(data.approvalStatus);
      } catch (err) {
        console.error("Error fetching A1 status:", err);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/student/submissions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ipms-user": JSON.stringify({
              _id: studentId,
              role: "student",
            }),
          },
        });
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    };

    if (user?.email) {
      fetchA1Status();
      fetchSubmissions();
    }
  }, [user?.email, studentId, backendUrl]);

  const handleResend = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/coordinator/request/${id}/resend`, {
        method: "POST",
      });
      if (res.ok) alert("Resent to coordinator!");
    } catch (err) {
      alert("Error resending.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/student/request/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ipms-user": JSON.stringify({ _id: studentId, role: "student" }),
        },
      });
      if (res.ok) {
        alert("Deleted successfully.");
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      alert("Error deleting.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/account/${user.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Account deletion error:", err);
      alert("Sorry, we couldn’t delete your account. Please try again.");
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user?.fullName}</h2>
      </div>

      <div className="dashboard-card">
        {/* FORM A1 Card */}
        <div className="card-section">
          <div className="card-content">
            <h3>Request Internship (FORM A1)</h3>
            <p>Status: {approvalStatus.replace("_", " ")}</p>
          </div>
          <button
            className="card-button"
            onClick={() => {
              if (
                approvalStatus === "not_submitted" ||
                approvalStatus === "draft"
              ) {
                navigate("/a1-form");
              }
            }}
            disabled={
              approvalStatus !== "not_submitted" &&
              approvalStatus !== "draft"
            }
          >
            {approvalStatus === "approved" ? "Track" : "Request Internship"}
          </button>
        </div>

        {/* FORM A2 Card */}
        <div className="card-section">
          <div className="card-content">
            <h3>Weekly Report (FORM A2)</h3>
            <p>
              {approvalStatus === "approved"
                ? "You may now submit weekly reports"
                : "Finish Form A1 approval first"}
            </p>
          </div>
          <button
            className="card-button"
            disabled={approvalStatus !== "approved"}
            onClick={() => navigate("/weekly-report")}
          >
            Request
          </button>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="submission-section">
        <h3>My Submissions</h3>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table className="submission-table">
            <thead>
              <tr>
                <th>Form</th>
                <th>Supervisor Status</th>
                <th>Coordinator Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id}>
                  <td>{s.form_type}</td>
                  <td>{s.supervisor_status}</td>
                  <td>{s.coordinator_status}</td>
                  <td>
                    {s.supervisor_status === "approved" &&
                    s.coordinator_status === "pending" ? (
                      <>
                        <button onClick={() => handleResend(s._id)}>
                          Resend
                        </button>
                        <button onClick={() => handleDelete(s._id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={handleDeleteAccount}
            style={{
              borderWidth: "3px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "0.5rem 0",
              maxWidth: "100%",
              cursor: "pointer",
            }}
          >
            {/* Trash SVG icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#e45858"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "10px" }}
            >
              <path
                d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
                stroke="#e45858"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span style={{ color: "#e45858", fontWeight: 500 }}>
              Delete My Account
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;