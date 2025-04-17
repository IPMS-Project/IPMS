import React from "react";
import "../styles/A1InternshipRequestForm.css";


const A1Form = ({ formData, readOnly = false, editableFields = [], onFieldChange = () => {} }) => {
  const isEditable = (field) => !readOnly || editableFields.includes(field);

  const handleChange = (field, value) => {
    if (editableFields.includes(field)) {
      onFieldChange(field, value);
    }
  };

  return (
    <div className="form-container">
      <h2>A.1 - Internship Request Form</h2>

      <div className="section-title">Internee & Workplace Information:</div>
      <table>
        <tbody>
          <tr>
            <th>Internee Name</th>
            <td>
              <input
                type="text"
                value={formData.interneeName || ""}
                readOnly
              />
            </td>
            <th>Sooner ID</th>
            <td>
              <input
                type="text"
                value={formData.soonerId || ""}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td>
              <input
                type="email"
                value={formData.interneeEmail || ""}
                readOnly
              />
            </td>
            <th>Phone</th>
            <td>
              <input
                type="text"
                value={formData.phone || ""}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>Workplace Name</th>
            <td>
              <input
                type="text"
                value={formData.workplaceName || formData.workplace?.name || ""}
                readOnly
              />
            </td>
            <th>Website</th>
            <td>
              <input
                type="text"
                value={formData.website || formData.workplace?.website || ""}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>Advisor Name</th>
            <td>
              <input
                type="text"
                value={formData.advisorName || formData.internshipAdvisor?.name || ""}
                readOnly
              />
            </td>
            <th>Advisor Email</th>
            <td>
              <input
                type="email"
                value={formData.advisorEmail || formData.internshipAdvisor?.email || ""}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>Credit Hours</th>
            <td>
              <input
                type="text"
                value={formData.creditHours || ""}
                readOnly
              />
            </td>
            <th>Start Date</th>
            <td>
              <input
                type="text"
                value={formData.startDate ? new Date(formData.startDate).toLocaleDateString() : ""}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>End Date</th>
            <td>
              <input
                type="text"
                value={formData.endDate ? new Date(formData.endDate).toLocaleDateString() : ""}
                readOnly
              />
            </td>
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </table>

      <div className="section-title">Task Descriptions & Outcomes:</div>
      <ol>
        {formData.tasks?.map((task, index) => (
          <li key={index}>
            <div><strong>Task {index + 1}:</strong> {task.description}</div>
            <div><strong>Outcomes:</strong> {task.outcomes?.join(", ")}</div>
          </li>
        ))}
      </ol>

      <div className="section-title">Supervisor Section:</div>
      <table>
        <tbody>
          <tr>
            <th className="signature-cell" colSpan={4}>
              Supervisor Comment & Signature
              <input
                type="text"
                value={formData.supervisor_comment || ""}
                readOnly={!isEditable("supervisor_comment")}
                onChange={(e) => handleChange("supervisor_comment", e.target.value)}
              />
              <span className="description">This field is editable by supervisor</span>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default A1Form;
