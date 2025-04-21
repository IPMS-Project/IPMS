import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ipmsUser"));
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
      </div>
    </div>
  );
};

export default StudentDashboard;