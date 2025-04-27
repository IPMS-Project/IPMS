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
  const handleDecision = (action) => {
    if (!comment.trim()) return setError("Comment is required.");
    if (!signature.trim()) return setError("Signature is required.");
    setError("");
    onAction(formData._id, action, comment.trim(), signature.trim());
  };

  function calculateWeeksBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInMilliseconds = end - start;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    const differenceInWeeks = differenceInDays / 7;
    return Math.floor(differenceInWeeks);
  }
  
  // Example usage:
  const weeks = calculateWeeksBetween(formData.startDate, formData.endDate);
  

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

  const renderA2 = () => (
    <>
      <h1>A2 – Weekly Evaluation</h1>
      <table className="dashboard-table">
      <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
        <tbody>
          <tr>
            <td><strong>Name:</strong> <p>{formData.interneeName || "N/A"}</p></td>
            <td></td>
            <td><strong>Email:</strong> <p>{formData.interneeEmail || "N/A"}</p></td>
          </tr>
          <tr>
            <td><strong>Current Week:</strong> <p>{formData.week / weeks || "N/A"}</p></td>
            <td><strong>Total Weeks:</strong><p>{weeks}</p></td>
            <td><strong>Hours:</strong> <p>{formData.hours|| "N/A"}</p></td>
          </tr>
        </tbody>
      </table>
      
  
      <div style={{ marginTop: "15px" }}>
        <strong>Tasks Performed</strong>
        <p>{formData.tasks || "No tasks provided"}</p>
      </div>
      <div style={{ marginTop: "15px" }}>
        <strong>Lessons Learned</strong>
        <p>{formData.lessons || "No lessons provided"}</p>
      </div>
    </>
  );

    const renderA3 = () => (
        <>
        <h1>A3 – Final Performance Eval</h1>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><p><strong>Name:</strong> {formData.interneeName}</p></td>
              <td><p><strong>Email:</strong> {formData.interneeEmail}</p></td>
            </tr>
          </tbody>
        </table>
        

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

  let renderedComponent;

  if (formData.form_type === "A1") {
    renderedComponent = renderA1();
  } else if (formData.form_type === "A2") {
    renderedComponent = renderA2();
  } else {
    renderedComponent = renderA3();
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {renderedComponent}
        {renderSignaturesAndActions()}
      </div>
    </div>
  );
  
};

export default ViewFormModal;
