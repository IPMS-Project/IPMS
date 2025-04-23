import React, { useState } from "react";
import "../styles/A1InternshipRequestForm.css";

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
    // Convert the start and end dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = end - start;
  
    // Convert milliseconds to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  
    // Convert days to weeks
    const differenceInWeeks = differenceInDays / 7;
  
    // Return the number of weeks, rounded down to the nearest whole number
    return Math.floor(differenceInWeeks);
  }
  
  // Example usage:
  const weeks = calculateWeeksBetween(formData.startDate, formData.endDate);
  

  // ✅ Inserted rendering helpers
  const renderA1 = () => (
    <>
      <h1>A1 – Internship Request Form</h1>
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
              <td><strong>Student Name:</strong> <p>{formData.interneeName || "N/A"}</p></td>
              <td><strong>Email:</strong> <p>{formData.interneeEmail || "N/A"}</p></td>
              <td></td>
            </tr>
            <tr>
              <td><strong>Workplace Name:</strong> {formData.workplace?.name || "N/A"}</td>
              <td><strong>Phone:</strong> {formData.workplace?.phone || "N/A"}</td>
              <td><strong>Website:</strong> {formData.workplace?.website || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Advisor Name:</strong> {formData.internshipAdvisor?.name || "N/A"}</td>
              <td><strong>Advisor Email:</strong> {formData.internshipAdvisor?.email || "N/A"}</td>
              <td></td>
            </tr>
            <tr>
              <td><strong>Credit Hours:</strong> {formData.creditHours}</td>
              <td>
                <strong>Start:</strong> {new Date(formData.startDate).toLocaleDateString()}<br />
                <strong>End:</strong> {new Date(formData.endDate).toLocaleDateString()}
              </td>
              <td><strong>Number of Weeks:</strong><p>{weeks}</p></td>
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

  const renderA2 = () => (
    <>
      <h1>A2 – Weekly Evaluation</h1>
      <table className="dashboard-table">
      <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
        <tbody>
          <tr>
            <td><strong>Name:</strong> <p>{formData.interneeName || "N/A"}</p></td>
            <td><strong>Email:</strong> <p>{formData.interneeEmail || "N/A"}</p></td>
          </tr>
          <tr>
            <td><strong>Week:</strong> <p>{formData.week || "N/A"}</p></td>
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
