import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";
import A1Form from "./A1Form"; // ✅ Make sure the filename is A1Form.js (capital F)

const ViewFormModal = ({ formData, onClose, onAction }) => {
  const [editableForm, setEditableForm] = useState(formData);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const handleFieldChange = (field, value) => {
    setEditableForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDecision = (action) => {
    if (!editableForm.supervisor_comment?.trim()) {
      setError("Comment is required before taking action.");
      return;
    }
    if (!signature.trim()) {
      setError("Signature is required before approval/rejection.");
      return;
    }

    const payloadComment = `${editableForm.supervisor_comment.trim()} | Supervisor Signature: ${signature.trim()}`;
    onAction(editableForm._id, action, payloadComment);
    setError("");
    onAction(formData._id, formData.form_type, action, payloadComment);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box large-form-modal">
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>A.1 Internship Request Form</h2>

        {/* ✅ Render the A1 form layout with only the comment field editable */}
        <A1Form
          formData={editableForm}
          readOnly={true}
          editableFields={["supervisor_comment"]}
          onFieldChange={handleFieldChange}
        />

        {/* ✅ Signature field (separate from form) */}
        <div className="form-section" style={{ marginTop: "20px" }}>
          <label><strong>Supervisor Signature:</strong></label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: "100%",
              padding: "6px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          <button className="approve" onClick={() => handleDecision("approve")}>Approve</button>
          <button className="reject" onClick={() => handleDecision("reject")}>Reject</button>
          <button className="reject" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewFormModal;
