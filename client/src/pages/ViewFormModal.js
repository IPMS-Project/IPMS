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

    const confirmed = window.confirm(`Are you sure you want to ${action} this request?`);
    if (!confirmed) return;

    setError("");
    onAction(formData._id, action, comment.trim());
  };

  const formatSignature = (sig) =>
    sig?.type === "text" ? `${sig.value} (Font: ${sig.font})` : "Signature unavailable";

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <h2>A3 – Job Performance Evaluation</h2>

        <h3>Internee Details</h3>
        <p><strong>Name:</strong> {formData.interneeName}</p>
        <p><strong>Sooner ID:</strong> {formData.interneeID}</p>
        <p><strong>Email:</strong> {formData.interneeEmail}</p>

        <h3>Evaluation</h3>
        {formData.evaluations?.length > 0 ? (
          <table className="dashboard-table" style={{ marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Rating</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {formData.evaluations.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{item.rating}</td>
                  <td>{item.comment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No evaluation data found.</p>
        )}

        <h3>Signatures</h3>
        <p><strong>Advisor Signature:</strong> {formatSignature(formData.advisorSignature)}</p>
        <p><strong>Coordinator Signature:</strong> {formatSignature(formData.coordinatorSignature)}</p>

        <div style={{ marginTop: "15px" }}>
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

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
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