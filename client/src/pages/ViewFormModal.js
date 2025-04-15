import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";

const ViewFormModal = ({ formData, onClose, onAction }) => {
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
        <h2>Form: A1</h2>
        <p><strong>Student ID:</strong> {formData.student}</p>
        <p><strong>Workplace:</strong> {formData.workplace?.name}</p>
        <p><strong>Advisor:</strong> {formData.internshipAdvisor?.name}</p>
        <p><strong>Credit Hours:</strong> {formData.creditHours}</p>
        <p><strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(formData.endDate).toLocaleDateString()}</p>

        <div>
          <strong>Tasks:</strong>
          <ul>
            {formData.tasks?.map((task, index) => (
              <li key={index}>
                <strong>Description:</strong> {task.description}
                <br />
                <strong>Outcomes:</strong> {task.outcomes.join(", ")}
              </li>
            ))}
          </ul>
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
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
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
