import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";

const ViewFormModal = ({ formData, onClose, onAction }) => {
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const handleDecision = (action) => {
    if (!comment.trim()) return setError("Comment is required.");
    if (!signature.trim()) return setError("Signature is required.");
    setError("");
    onAction(formData._id, action, comment.trim(), signature.trim());
  };

  // ✅ Inserted rendering helpers
  const renderA1 = () => (
    <>
      <h2>A1 – Internship Request Form</h2>
     <table className="modal-details-table">
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Student Name:</strong> {formData.interneeName || "N/A"}</td>
              <td><strong>Student ID:</strong> {formData.soonerId || "N/A"}</td>
              <td><strong>Email:</strong> {formData.interneeEmail || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Workplace Name:</strong> {formData.workplace?.name || "N/A"}</td>
              <td><strong>Phone:</strong> {formData.workplace?.phone || "N/A"}</td>
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
    </>
  );

    const renderA3 = () => (
        <>
        <h2>A3 – Final Job Performance Evaluation</h2>
        <p><strong>Name:</strong> {formData.interneeName}</p>
        <p><strong>Email:</strong> {formData.interneeEmail}</p>
        <p><strong>Sooner ID:</strong> {formData.interneeID}</p>

        <h3>Evaluation Items</h3>
        <table className="dashboard-table">
        <thead>
        <tr>
        <th>Category</th>
        <th>Rating</th>
        <th>Comment</th>
        </tr>
        </thead>
        <tbody>
        {formData.evaluations?.map((item, i) => (
            <tr key={i}>
            <td>{item.category}</td>
            <td>{item.rating}</td>
            <td>{item.comment || "-"}</td>
            </tr>
        ))}
        </tbody>
      </table>
    </>
  );

  const renderSignaturesAndActions = () => (
    <>
      <h3>Supervisor Review</h3>
      <label>Signature:</label>
      <input
        type="text"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        style={{ width: "100%", marginBottom: "8px" }}
      />
      <label>Comment:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        style={{ width: "100%" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px" }}>
        <button className="approve" onClick={() => handleDecision("approve")}>Approve</button>
        <button className="reject" onClick={() => handleDecision("reject")}>Reject</button>
        <button onClick={onClose}>Close</button>
      </div>
    </>
  );

    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxHeight: "90vh", overflowY: "auto" }}>
          {formData.form_type === "A1" ? renderA1() : renderA3()}
          {renderSignaturesAndActions()}
        </div>
      </div>
    );
};

export default ViewFormModal;
