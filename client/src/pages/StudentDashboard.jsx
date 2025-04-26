import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";
import Swal from "sweetalert2";

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


  const handleAccountDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Your account will be permanently deleted. This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e45858",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Make API call to delete account
          const res = await fetch(`${backendUrl}/api/token/delete`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ouEmail }),
          });
          const data = await res.json();
          if (res.ok) {
           
            Swal.fire("Deleted!", data.message || "Your account has been deleted.", "success")
              .then(() => {
                // Redirect to login page
                navigate("/", { replace: true });
                // Optionally, force reload to clear history stack
                window.location.reload();
              });
          } else {
            Swal.fire("Error", data.error || "Account deletion failed.", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Account deletion failed.", "error");
        }
      }
    });
  };

  return (
    <div className="student-dashboard">
      

      <div className="dashboard-card">
      <div
          className="container-fluid p-4 mb-4"
          style={{
            background: "#842020",
            borderRadius: "15px",
            marginTop: "20px",
          }}
        >
          <div className="d-flex align-items-center">
            {/* Avatar Icon */}
            <div
              className="rounded-circle bg-light d-flex align-items-center justify-content-center"
              style={{ width: 250, height: 250, marginRight: 50 }}
            >
              {/* Bootstrap "person" icon, can use font-awesome as well */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="140"
                height="140"
                fill="#90313A"
                className="bi bi-person"
                viewBox="0 0 16 16"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4-3a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm2 8c0 1-1 2-6 2s-6-1-6-2 1-2 6-2 6 1 6 2zm-1.995-.15c-.977-.211-2.488-.35-4.005-.35-1.517 0-3.028.139-4.005.35C2.523 12.368 4.033 13 8 13s5.477-.632 5.995-1.15z" />
              </svg>
            </div>
            {/* Student Info */}
            <div>
              <h1 className="text-white fw-bold" style={{ fontSize: "3rem" }}>
                {user.fullName}
              </h1>
              <div className="mt-3">
                <span
                  className="badge rounded-pill px-4 py-2"
                  style={{ background: "#712622", fontSize: "1.7rem" }}
                >
                  Advisor: [{user.academicAdvisor}]
                </span>
              </div>
              <div className="mt-3">
                <span
                  className="badge rounded-pill px-4 py-2"
                  style={{ background: "#712622", fontSize: "1.7rem" }}
                >
                  Semester: [{user.semester}]
                </span>
              </div>
            </div>
          </div>
        </div>
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
            style={{
              borderWidth: "3px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "0.5rem 0",
              maxWidth: "100%",
              cursor:"pointer"
            }}
            onClick={handleAccountDelete}
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