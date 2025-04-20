import React, { useState } from "react";
import "../styles/A1InternshipRequestForm.css";

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

const ViewFormModal = ({ formData, onClose, onAction, onActionComplete }) => {
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const handleAction = async (action) => {
    if (!comment.trim()) {
      setError("Comment is required before taking action.");
      return;
    }
    if (!signature.trim()) {
      setError("Signature is required before approval/rejection.");
      return;
    }

    try {
      const payload = {
        soonerId: formData.soonerId,
        comment,
        signature,
        status: action === "approve" ? "Approved" : "Rejected",
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/form/supervisor-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      console.log("Supervisor action saved:", data);
      onActionComplete();
      onClose();
    } catch (err) {
      console.error("Action failed:", err);
      setError(err.message || "Error performing action");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content form-container">
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

          <h3 className="section-title">Signatures</h3>
          <table>
            <tbody>
              <tr>
                <td className="signature-cell" colSpan="3">
                  Internee Signature:<br />
                  <input
                    type="text"
                    value={formData.interneeSignature || ""}
                    readOnly
                  />
                </td>
                <td className="signature-cell" colSpan="3">
                  Internship Advisor Signature:<br />
                  <input
                    type="text"
                    value={signature}
                    // readOnly
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </td>
                <td className="signature-cell" colSpan="2">
                  Internship Coordinator Approval:<br />
                  <input
                    type="text"
                    value={formData.coordinatorApproval || ""}
                    readOnly
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="comment-signature">
            <textarea
              placeholder="Supervisor comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {/* <input
              type="text"
              placeholder="Supervisor signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            /> */}
          </div>
          {error && <div className="error-msg">{error}</div>}

          <div className="submit-section">
            <button type="button" className="approve-btn" onClick={() => handleAction("approve")}>Approve</button>
            <button type="button" className="reject-btn" onClick={() => handleAction("reject")}>Reject</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewFormModal;
