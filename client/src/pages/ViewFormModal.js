import React, { useState } from "react";
import "../styles/SupervisorDashboard.css";

const outcomeLabels = [
  "Problem Solving",
  "Solution Development",
  "Communication",
  "Decision-Making",
  "Collaboration",
  "Application",
];

const outcomeDescriptions = [
    "Understand and solve complex computing problems",
    "Create, build, and assess computing solutions",
    "Communicate clearly and confidently",
    "Make responsible decisions",
    "Work well within a team",
    "Apply computer science algorithms to create practical solutions",
];

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
  <h2>A.1 - Internship Request Form</h2>
  <form>
    <h3 className="section-title">Internee & Workplace Information:</h3>
    <table>
      <thead>
        <tr>
          <th colSpan="3">Internee Details</th>
          <th colSpan="3">Workplace Details</th>
          <th colSpan="2">Internship Advisor Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="3">
            Name:<br />
            <input type="text" value={formData.studentName} readOnly />
          </td>
          <td colSpan="3">
            Name:<br />
            <input type="text" value={formData.workplace.name} readOnly />
          </td>
          <td colSpan="2">
            Name:<br />
            <input type="text" value={formData.internshipAdvisor.name} readOnly />
          </td>
        </tr>
        <tr>
          <td colSpan="3">
            Sooner ID:<br />
            <input type="text" value={formData.soonerId} readOnly />
          </td>
          <td colSpan="3">
            Website:<br />
            <input type="text" value={formData.workplace.website} readOnly />
          </td>
          <td colSpan="2">
            Job Title:<br />
            <input type="text" value={formData.internshipAdvisor.jobTitle} readOnly />
          </td>
        </tr>
        <tr>
          <td colSpan="3">
            Email:<br />
            <input type="text" value={formData.studentEmail} readOnly />
          </td>
          <td colSpan="3">
            Phone:<br />
            <input type="text" value={formData.workplace.phone} readOnly />
          </td>
          <td colSpan="2">
            Email:<br />
            <input type="text" value={formData.internshipAdvisor.email} readOnly />
          </td>
        </tr>
        <tr>
          <td colSpan="3">
            Credit Hours:<br />
            <input type="text" value={formData.creditHours} readOnly />
          </td>
          <td colSpan="3">
            Start Date:<br />
            <input type="text" value={formData.startDate?.split("T")[0]} readOnly />
          </td>
          <td colSpan="2">
            End Date:<br />
            <input type="text" value={formData.endDate?.split("T")[0]} readOnly />
          </td>
        </tr>
      </tbody>
    </table>

    <h3 className="section-title">Task Details & Program Outcomes</h3>
    <table className="task-table" style={{ border: "1px solid #999" }}>
      <thead>
        <tr>
          <th style={{ width: "20%", border: "1px solid #999" }}>Task</th>
          {outcomeLabels.map((label, i) => (
            <th
              key={label}
              style={{ width: "13.33%", border: "1px solid #999" }}
            >
              {label}
              <br />
              <small>({outcomeDescriptions[i]})</small>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {formData.tasks.map((task, i) => (
          <tr key={i}>
            <td style={{ border: "1px solid #999" }}>
              <input
                type="text"
                value={task.description}
                readOnly
                style={{ width: "100%", border: "none" }}
              />
            </td>
            {outcomeLabels.map((outcome, j) => (
              <td
                key={j}
                style={{ border: "1px solid #999" }}
                className={
                  task.outcomes?.includes(outcome.toLowerCase())
                    ? "outcome-yes"
                    : "outcome-no"
                }
              >
                {task.outcomes?.includes(outcome.toLowerCase()) ? "✔" : ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      </table>
      </form>
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
        <div className="modal-content form-container">
        {formData.form_type === "A1" ? renderA1() : renderA3()}
      {renderSignaturesAndActions()}
      </div>
    </div>
  );
};

export default ViewFormModal;
