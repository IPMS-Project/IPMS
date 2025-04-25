import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";
import Swal from "sweetalert2";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("ipmsUser"));
  const ouEmail = user?.email;
  const [approvalStatus, setApprovalStatus] = useState("not_submitted");

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
