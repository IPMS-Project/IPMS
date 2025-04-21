import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";

const ViewFormModal = ({ formData, onClose, onAction }) => {
  const form = typeof formData.details === "string"
    ? JSON.parse(formData.details)
    : formData.details || formData;

  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleDecision = (action) => {
    if (!comment.trim()) {
      setError("Comment is required before taking action.");
      return;
    }
    setError("");
    onAction(formData._id, action, comment);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>A.2 - Weekly Progress Report</h2>

        <div>
          <label><strong>Student Name:</strong></label>
          <input
            type="text"
            value={formData.name || "N/A"}
            readOnly
            className="readonly-input"
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label><strong>Student ID:</strong></label>
          <input
            type="text"
            value={formData.student_id || "N/A"}
            readOnly
            className="readonly-input"
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label><strong>Week:</strong></label>
          <input
            type="text"
            value={form.week || ""}
            readOnly
            className="readonly-input"
          />
        </div>

        <div>
          <label><strong>Hours:</strong></label>
          <input
            type="text"
            value={form.hours || ""}
            readOnly
            className="readonly-input"
          />
        </div>

        <div>
          <label><strong>Tasks Performed:</strong></label>
          <textarea
            value={form.tasks || ""}
            readOnly
            className="readonly-input"
            rows={3}
          />
        </div>

        <div>
          <label><strong>Lessons Learned:</strong></label>
          <textarea
            value={form.lessons || form.lessonsLearned || ""}
            readOnly
            className="readonly-input"
            rows={3}
          />
        </div>

        <div>
          <label><strong>Comment:</strong></label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comment before approval or rejection"
            rows={4}
            style={{ width: "100%", marginTop: "5px", borderRadius: "4px", padding: "8px" }}
          />
          {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}
        </div>

        <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="approve" onClick={() => handleDecision("approve")}>Approve</button>
          <button className="reject" onClick={() => handleDecision("reject")}>Reject</button>
        </div>

        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <button className="reject" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewFormModal;
