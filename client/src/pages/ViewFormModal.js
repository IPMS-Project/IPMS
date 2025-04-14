import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";

const ViewFormModal = ({ formData, onClose, onAction }) => {
  const form = typeof formData.details === "string" ? JSON.parse(formData.details) : formData.details;
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleDecision = (action) => {
    if (!comment.trim()) {
      setError("Comment is required before taking action.");
      return;
    }
    setError("");  // clear error
    onAction(formData._id, action, comment);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Form: {formData.form_type}</h2>
        <p><strong>Student:</strong> {formData.name}</p>

        {form.tasks && (
          <div>
            <strong>Tasks:</strong>
            <ul>{form.tasks.map((task, i) => <li key={i}>{task}</li>)}</ul>
          </div>
        )}

        {form.outcomes && (
          <div>
            <strong>Outcomes:</strong>
            <ul>{form.outcomes.map((o, i) => <li key={i}>{o}</li>)}</ul>
          </div>
        )}

        {form.week && <p><strong>Week:</strong> {form.week}</p>}
        {form.lessonsLearned && <p><strong>Lessons Learned:</strong> {form.lessonsLearned}</p>}

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
