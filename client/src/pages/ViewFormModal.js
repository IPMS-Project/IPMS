import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";

const ViewFormModal = ({ formData, onClose, onAction }) => {
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const handleDecision = (action) => {
    if (!comment.trim()) {
      setError("Comment is required before taking action.");
      return;
    }
    if (!signature.trim()) {
      setError("Signature is required before approval/rejection.");
      return;
    }

    const payloadComment = `${comment.trim()} | Supervisor Signature: ${signature.trim()}`;
    setError("");
    onAction(formData._id, formData.form_type, action, payloadComment);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>A.1 Internship Request Form</h2>

        <table className="modal-details-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Student Name:</strong> {formData.student?.userName || formData.student?.name || "N/A"}</td>
              <td><strong>Student ID:</strong> {formData.student?._id || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong> {formData.student?.email || "N/A"}</td>
              <td><strong>Phone:</strong> {formData.workplace?.phone || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Workplace Name:</strong> {formData.workplace?.name || "N/A"}</td>
              <td><strong>Website:</strong> {formData.workplace?.website || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Advisor Name:</strong> {formData.internshipAdvisor?.name || "N/A"}</td>
              <td><strong>Advisor Email:</strong> {formData.internshipAdvisor?.email || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Credit Hours:</strong> {formData.creditHours}</td>
              <td>
                <strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}
                <br />
                <strong>End Date:</strong> {new Date(formData.endDate).toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "15px" }}>
          <strong>Task Descriptions & Outcomes:</strong>
          <ul>
            {formData.tasks?.map((task, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <strong>Task {index + 1}:</strong> {task.description}
                <br />
                <strong>Outcomes:</strong> {task.outcomes?.join(", ") || "N/A"}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label><strong>Supervisor Signature:</strong></label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter your full name"
            style={{ width: "100%", padding: "6px", marginTop: "5px", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label><strong>Comment:</strong></label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comment before approval or rejection"
            rows={4}
            style={{ width: "100%", marginTop: "5px", borderRadius: "4px", padding: "8px" }}
          />
        </div>

        {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}

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
