import React, { useState, useEffect } from "react";
import "../styles/A1InternshipRequestForm.css";

const outcomeLabels = [
  "Problem Solving",
  "Solution Development",
  "Communication",
  "Decision Making",
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

const A1InternshipRequestForm = () => {
  const initialState = {
    interneeName: "",
    soonerId: "",
    interneeEmail: "",
    workplaceName: "",
    website: "",
    phone: "",
    startDate: "",
    endDate: "",
    advisorName: "",
    advisorJobTitle: "",
    advisorEmail: "",
    interneeSignature: "",
    advisorSignature: "",
    coordinatorApproval: "",
    creditHours: "",
    tasks: Array(5).fill({ description: "", outcomes: [] }),
  };

  const [formData, setFormData] = useState(initialState);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [dateError, setDateError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "startDate" || id === "endDate") {
      setDateError("");
      if (formData.startDate && formData.endDate) {
        validateDates(
          id === "startDate" ? value : formData.startDate,
          id === "endDate" ? value : formData.endDate
        );
      }
    }
  };

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) {
      setDateError("End date must be after start date");
    } else {
      setDateError("");
    }
  };

  const handleCreditHourChange = (value) => {
    setFormData((prev) => ({ ...prev, creditHours: value }));
  };

  const handleTaskChange = (index, value) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = { ...updatedTasks[index], description: value };
    setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
  };
  

  const validateForm = () => {
    const namePattern = /^[A-Za-z\s]+$/;
    const soonerIdPattern = /^[0-9]{9}$/;
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;

    const newErrors = {};

    if (!formData.interneeName) newErrors.interneeName = "Internee name is required";
    else if (!namePattern.test(formData.interneeName)) newErrors.interneeName = "Name should contain only letters and spaces";

    if (!formData.soonerId) newErrors.soonerId = "Sooner ID is required";
    else if (!soonerIdPattern.test(formData.soonerId)) newErrors.soonerId = "Sooner ID should be a 9-digit number";

    if (!formData.interneeEmail) newErrors.interneeEmail = "Email is required";
    else if (!emailPattern.test(formData.interneeEmail)) newErrors.interneeEmail = "Invalid email format";

    if (!formData.workplaceName) newErrors.workplaceName = "Workplace name is required";
    else if (!namePattern.test(formData.workplaceName)) newErrors.workplaceName = "Workplace name should contain only letters and spaces";

    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!phonePattern.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";

    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    else if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) newErrors.endDate = "End date must be after start date";
    }

    if (!formData.advisorName) newErrors.advisorName = "Advisor name is required";
    else if (!namePattern.test(formData.advisorName)) newErrors.advisorName = "Advisor name should contain only letters and spaces";

    if (!formData.advisorEmail) newErrors.advisorEmail = "Advisor email is required";
    else if (!emailPattern.test(formData.advisorEmail)) newErrors.advisorEmail = "Invalid advisor email format";

    if (!formData.interneeSignature) newErrors.interneeSignature = "Internee signature is required";
    else if (!namePattern.test(formData.interneeSignature)) newErrors.interneeSignature = "Signature should contain only letters and spaces";

    if (formData.advisorSignature && !namePattern.test(formData.advisorSignature)) {
      newErrors.advisorSignature = "Signature should contain only letters and spaces";
    }

    if (formData.coordinatorApproval && !namePattern.test(formData.coordinatorApproval)) {
      newErrors.coordinatorApproval = "Approval should contain only letters and spaces";
    }

    if (!formData.creditHours) newErrors.creditHours = "Please select credit hours";

    const tasksFilled = formData.tasks.filter((task) => task.description.trim() !== "").length >= 3;
    if (!tasksFilled) newErrors.tasks = "At least 3 tasks are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitFormData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/form/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to submit form", {cause: response});
      }
      const data = await response.json();
      console.log("Form submitted successfully:", data);
      return data;
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (validateForm()) {
  //     // sending descriptions to backend to check if they align with CS outcomes
  //     const taskDescriptions = formData.tasks
  //     .map(task => task.description.trim())
  //     .filter(Boolean);
  //     sendTaskDescriptions(taskDescriptions);
  //     //ending here
  //     submitFormData().then(data => {
  //       const recipient = data.manual ? "coordinator for manual review!" : "advisor!";
  //       setSuccessMsg("Form submitted successfully and sent to " + recipient);
  //       setTimeout(() => setSuccessMsg(""), 15000);
  //     }).catch(err => setErrors("Form submission failed! " + err))
  //       .finally(() => setFormData(initialState));
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    const taskDescriptions = formData.tasks
      .map(task => task.description.trim())
      .filter(Boolean);
  
    try {
      const aligned = await sendTaskDescriptions(taskDescriptions);
  
      if (aligned && aligned.length > 0) {
        setFormData(prev => ({
          ...prev,
          tasks: aligned
        }));
  
        const submissionResponse = await submitFormData();
  
        const recipient = submissionResponse.manual ? "coordinator for manual review!" : "supervisor!";
        setSuccessMsg("Form submitted successfully and sent to " + recipient);
        setTimeout(() => setSuccessMsg(""), 15000);
        setFormData(initialState);
      } else {
        setErrors({ tasks: "Outcome alignment failed or returned no tasks." });
      }
    } catch (err) {
      console.error("Error during submission:", err);
      setErrors({ submit: "Form submission failed! " + err.message });
    }
  };
  
  const sendTaskDescriptions = async (descriptions) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/align-outcomes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tasks: descriptions }) 
      });
  
      if (!response.ok) {
        throw new Error("Failed to send task descriptions");
      }
  
      const data = await response.json();
      console.log("Alignment result:", data);
  
      const updatedTasks = data.results.map(({ task, matched_outcomes }) => ({
        description: task,
        outcomes: matched_outcomes
      }));
  
      setFormData(prev => ({
        ...prev,
        tasks: updatedTasks
      }));
      console.log("Set updated tasks to state:", updatedTasks);

      console.log("Current formData.tasks after set:", formData.tasks);

  
      return updatedTasks;
  
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const taskDescriptionsKey = formData.tasks.map((t) => t.description).join(",");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const descriptions = formData.tasks.map((task) => task.description.trim()).filter(Boolean);
  
      if (descriptions.length > 0) {
        fetch(`${process.env.REACT_APP_API_URL}/api/align-outcomes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: descriptions }),
        })
          .then((res) => res.json())
          .then((data) => {
            const updatedTasks = formData.tasks.map((task) => {
              const match = data.results.find((r) => r.task === task.description);
              return match ? { ...task, outcomes: match.matched_outcomes } : { ...task, outcomes: [] };
            });
            setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
          })
          .catch((err) => console.error("Outcome alignment error:", err));
      }
    }, 500); // debounce for 0.5 sec
  
    return () => clearTimeout(timeout);
  }, [taskDescriptionsKey]);


  const renderOutcomeCell = (task, outcome, key) => {
    const normalizedOutcome = outcome.charAt(0).toLowerCase() + outcome.replace(/\s+/g, "").slice(1);
    const isMatched = task.outcomes.includes(normalizedOutcome);
    // console.log("Rendering cell for", outcome, "→ matched:", task.outcomes);

  
    return (
      <td key={key} style={{ backgroundColor: isMatched ? "#c6f6d5" : "", padding: "4px" }}>
        <input
          type="text"
          value={isMatched ? "✔" : ""}
          readOnly
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "none",
            textAlign: "center",
            backgroundColor: "transparent",
          }}
        />
      </td>
    );
  };
  
  

  return (
    <div className="form-container">
      <h2>A.1 - Internship Request Form</h2>
      <form onSubmit={handleSubmit}>
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
                Name<span className="required-asterisk">*</span>:<br />
                <input type="text" id="interneeName" value={formData.interneeName} onChange={handleInputChange} />
              </td>
              <td colSpan="3">
                Name<span className="required-asterisk">*</span>:<br />
                <input type="text" id="workplaceName" value={formData.workplaceName} onChange={handleInputChange} />
              </td>
              <td colSpan="2">
                Name<span className="required-asterisk">*</span>:<br />
                <input type="text" id="advisorName" value={formData.advisorName} onChange={handleInputChange} />
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                Sooner ID<span className="required-asterisk">*</span>:<br />
                <input type="text" id="soonerId" value={formData.soonerId} onChange={handleInputChange} />
              </td>
              <td colSpan="3">
                Website:<br />
                <input type="text" id="website" value={formData.website} onChange={handleInputChange} />
              </td>
              <td colSpan="2">
                Job Title:<br />
                <input type="text" id="advisorJobTitle" value={formData.advisorJobTitle} onChange={handleInputChange} />
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                Email<span className="required-asterisk">*</span>:<br />
                <input type="email" id="interneeEmail" value={formData.interneeEmail} onChange={handleInputChange} />
              </td>
              <td colSpan="3">
                Phone<span className="required-asterisk">*</span>:<br />
                <input type="text" id="phone" value={formData.phone} onChange={handleInputChange} />
              </td>
              <td colSpan="2">
                Email<span className="required-asterisk">*</span>:<br />
                <input type="email" id="advisorEmail" value={formData.advisorEmail} onChange={handleInputChange} />
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="signature-cell">
                <strong>Select the Number of Credit Hours<span className="required-asterisk">*</span></strong>
              </td>
              <td colSpan="3">
                Start Date<span className="required-asterisk">*</span>:<br />
                <input type="date" id="startDate" value={formData.startDate} onChange={handleInputChange} />
              </td>
              <td colSpan="2">
                End Date<span className="required-asterisk">*</span>:<br />
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={handleInputChange}
                />
                {dateError && <div className="date-error" style={{ color: "red", fontSize: "0.8rem" }}>{dateError}</div>}
              </td>
            </tr>
            <tr>
              {[1, 2, 3].map((val) => (
                <td key={val} style={{ textAlign: "center" }}>
                  {val}<br />
                  <input
                    type="checkbox"
                    checked={formData.creditHours === val.toString()}
                    onChange={() => handleCreditHourChange(val.toString())}
                  />
                </td>
              ))}
              <td colSpan="5"></td>
            </tr>
          </tbody>
        </table>

        <h3 className="section-title">Task Details & Program Outcomes<span className="required-asterisk">*</span></h3>
        <div className="table-box">
          <div className="job-description-box">
            <strong>Job Description Details:</strong>
            <ol>
              <li>Tasks need to be filled by the Internship Advisor.</li>
              <li>Only task description fields are editable.</li>
              <li>All tasks should cover a minimum of three outcomes.</li>
            </ol>
          </div>
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Task</th>
                {outcomeLabels.map((label, j) => (
  <th key={`label-${j}`} style={{ width: "13.33%" }}>
    {label}
    <br />
    <small>({outcomeDescriptions[j]})</small>
  </th>
))}

              </tr>
            </thead>
            <tbody>
            {formData.tasks.map((task, i) => (
  <tr key={i}>
    <td>
      <input
        type="text"
        placeholder={`Task ${i + 1}`}
        value={task.description}
        onChange={(e) => handleTaskChange(i, e.target.value)}
        style={{ width: "100%", padding: "4px", boxSizing: "border-box" }}
      />
    </td>

    {outcomeLabels.map((label, j) =>
      renderOutcomeCell(formData.tasks[i], label, `${i}-${j}`)
    )}
  </tr>
))}

            </tbody>
          </table>
        </div>

        <h3 className="section-title">Signatures:</h3>
        <table>
          <tbody>
            <tr>
              <td className="signature-cell" colSpan="3">
                Internee Signature<span className="required-asterisk">*</span>:<br />
                <input
                  type="text"
                  id="interneeSignature"
                  value={formData.interneeSignature}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  style={{ width: "100%", padding: "4px", boxSizing: "border-box" }}
                />
              </td>
              <td className="signature-cell" colSpan="3">
                Internship Advisor Signature:<br />
                <input
                  type="text"
                  id="advisorSignature"
                  value={formData.advisorSignature}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  style={{ width: "100%", padding: "4px", boxSizing: "border-box" }}
                />
              </td>
              <td className="signature-cell" colSpan="2">
                Internship Coordinator Approval:<br />
                <input
                  type="text"
                  id="coordinatorApproval"
                  value={formData.coordinatorApproval}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  style={{ width: "100%", padding: "4px", boxSizing: "border-box" }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {Object.keys(errors).length > 0 && (
          <div>
            <div className="error-summary">Please correct the following errors:</div>
            {Object.values(errors).map((err, i) => (
              <div key={i} className="error-msg">{err}</div>
            ))}
          </div>
        )}

        <div className="submit-section">
          <button type="submit">Submit Form</button>
        </div>
        {successMsg && <div className="success-msg">{successMsg}</div>}
      </form>
    </div>
  );
};

export default A1InternshipRequestForm;
