import React, { useState, useEffect } from "react";
import "../styles/A1InternshipRequestForm.css";
import { useNavigate } from "react-router-dom";

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

const signatureFonts = [
  { name: "Dancing Script", class: "font-dancing-script" },
  { name: "Great Vibes", class: "font-great-vibes" },
  { name: "Pacifico", class: "font-pacifico" },
  { name: "Satisfy", class: "font-satisfy" },
  { name: "Caveat", class: "font-caveat" },
];


const SignatureInput = ({ id, value, onChange, disabled, placeholder }) => {
  const [showFonts, setShowFonts] = useState(false);
  const [selectedFont, setSelectedFont] = useState(signatureFonts[0].class);
  const [nameInput, setNameInput] = useState(value);

  useEffect(() => {
    setNameInput(value);
  }, [value]);

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
    onChange({ target: { id, value: e.target.value } });
  };

  const selectFont = (fontClass) => {
    setSelectedFont(fontClass);
    setShowFonts(false);
  };

  return (
    <div className="signature-input-container">
      <input
        type="text"
        value={nameInput}
        onChange={handleNameChange}
        placeholder={placeholder}
        disabled={disabled}
        className="signature-name-input"
        onFocus={() => !disabled && setShowFonts(true)}
      />
      {showFonts && nameInput && (
        <div className="signature-font-options">
          <div className="signature-font-preview-header">
            Select a signature style:
          </div>
          {signatureFonts.map((font) => (
            <div
              key={font.class}
              className={`signature-font-preview ${font.class}`}
              onClick={() => selectFont(font.class)}
            >
              {nameInput}
            </div>
          ))}
        </div>
      )}
      {nameInput && (
        <div className={`signature-preview ${selectedFont}`}>
          {nameInput}
          <input type="hidden" id={id} value={nameInput} />
        </div>
      )}
    </div>
  );
};

const A1InternshipRequestForm = ({ userRole = "student" }) => {
   const navigate = useNavigate();
  const initialState = {
    interneeName: "",
    // soonerId: "",
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
    creditHours: "",
    tasks: Array(5).fill({ description: "", outcomes: [] }), 
    supervisorComments: "",
    coordinatorComments: "",
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    const ouEmail = localStorage.getItem("ouEmail");

    fetch(
      `${
        process.env.REACT_APP_API_URL
      }/api/student/me?ouEmail=${encodeURIComponent(ouEmail)}`
    )
      .then((res) => {
        console.log("Fetch status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fetch returned:", data);
        setFormData((f) => ({
          ...f,
          interneeName: data.interneeName,
          soonerId: data.soonerId,
          interneeEmail: data.interneeEmail,
        }));
      })
      .catch((err) => console.error("Prefill error:", err));
  }, []);

  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [dateError, setDateError] = useState("");

  const isFieldEditable = (fieldType) => {
    switch (userRole) {
      case "student":
        return ![
          "advisorSignature",
          "coordinatorApproval",
          "supervisorComments",
          "coordinatorComments",
        ].includes(fieldType);
      case "supervisor":
        return ["advisor", "supervisorComments"].includes(fieldType);
      case "coordinator":
        return ["coordinator", "coordinatorComments", "advisor"].includes(
          fieldType
        );
      default:
        return true;
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("ipmsUser"));
    if (storedUser) {
      setFormData((prev) => ({
        ...prev,
        interneeName: storedUser.fullName || "",
        interneeEmail: storedUser.email || ""
      }));
    }
  }, []);

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
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) setDateError("End date must be after start date");
    else setDateError("");
  };

  const handleCreditHourChange = (e) => {
    setFormData((prev) => ({ ...prev, creditHours: e.target.value }));
  };

  const handleTaskChange = (index, value) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = { ...updatedTasks[index], description: value };
    setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const descriptions = formData.tasks
        .map((task) => task.description.trim())
        .filter(Boolean);
      if (descriptions.length > 0) {
        fetch(`${process.env.REACT_APP_API_URL}/api/align-outcomes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: descriptions }),
        })
          .then((res) => res.json())
          .then((data) => {
            const updatedTasks = formData.tasks.map((task) => {
              const match = data.results.find(
                (r) => r.task === task.description
              );
              return match
                ? { ...task, outcomes: match.matched_outcomes }
                : { ...task, outcomes: [] };
            });
            setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
          })
          .catch((err) => console.error("Outcome alignment error:", err));
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [formData.tasks]);

  const renderOutcomeCell = (task, outcome, key) => {
    const normalizedOutcome =
      outcome.charAt(0).toLowerCase() + outcome.replace(/\s+/g, "").slice(1);
    const isMatched = task.outcomes.includes(normalizedOutcome);
    return (
      <td
        key={key}
        style={{ backgroundColor: isMatched ? "#c6f6d5" : "", padding: "4px" }}
      >
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

  const validateForm = () => {
    const namePattern = /^[A-Za-z\s]+$/;
    // const numberPattern = /^[0-9]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    const newErrors = {};

    if (!formData.interneeName) newErrors.interneeName = "Internee name is required";
    else if (!namePattern.test(formData.interneeName)) newErrors.interneeName = "Name should contain only letters and spaces";
    //if (!formData.soonerId) newErrors.soonerId = "Sooner ID is required";
    //else if (!numberPattern.test(formData.soonerId)) newErrors.soonerId = "Sooner ID should be numeric";
    if (!formData.interneeEmail) newErrors.interneeEmail = "Email is required";
    else if (!emailPattern.test(formData.interneeEmail))
      newErrors.interneeEmail = "Invalid email format";
    if (!formData.workplaceName)
      newErrors.workplaceName = "Workplace name is required";
    else if (!namePattern.test(formData.workplaceName))
      newErrors.workplaceName =
        "Workplace name should contain only letters and spaces";
    if (formData.website && !formData.website.includes("."))
      newErrors.website = "Please enter a valid website address";
    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!phonePattern.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.advisorName) newErrors.advisorName = "Supervisor name is required";
    else if (!namePattern.test(formData.advisorName)) newErrors.advisorName = "Supervisor name should contain only letters and spaces";
    if (!formData.advisorEmail) newErrors.advisorEmail = "Supervisor email is required";
    else if (!emailPattern.test(formData.advisorEmail)) newErrors.advisorEmail = "Invalid supervisor email format";
    if (!formData.interneeSignature) newErrors.interneeSignature = "Internee signature is required";
    else if (!namePattern.test(formData.interneeSignature)) newErrors.interneeSignature = "Signature should contain only letters and spaces";
    if (!formData.creditHours) newErrors.creditHours = "Please select credit hours";
    const tasksFilled = formData.tasks.filter((task) => task.description.trim() !== "").length >= 3;
    if (!tasksFilled) newErrors.tasks = "At least 3 tasks are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitFormData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/form/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to submit form");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };


  const sendTaskDescriptions = async (descriptions) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/align-outcomes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: descriptions }),
        }
      );

      if (!response.ok) throw new Error("Failed to send task descriptions");
      const data = await response.json();
      return data.results.map(({ task, matched_outcomes }) => ({
        description: task,
        outcomes: matched_outcomes,
      }));
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const taskDescriptions = formData.tasks
      .map((task) => task.description.trim())
      .filter(Boolean);
    try {
      const aligned = await sendTaskDescriptions(taskDescriptions);
      if (aligned && aligned.length > 0) {
        setFormData((prev) => ({ ...prev, tasks: aligned }));
        const submissionResponse = await submitFormData();
        const recipient = submissionResponse.manual
          ? "coordinator for manual review!"
          : "supervisor!";
        setSuccessMsg(`Form submitted successfully and sent to ${recipient}`);
        setTimeout(() => setSuccessMsg(""), 15000);
        setFormData(initialState);
          
      const timeoutId = setTimeout(() => {
        navigate('/student-dashboard');
      }, 1000);

     
      return () => clearTimeout(timeoutId);
      } else {
        setErrors({ tasks: "Outcome alignment failed or returned no tasks." });
      }
    } catch (err) {
      setErrors({ submit: `Form submission failed! ${err.message}` });
    }
  };

  useEffect(() => {
    const fonts = [
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap",
      "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap",
      "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
      "https://fonts.googleapis.com/css2?family=Satisfy&display=swap",
      "https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap",
    ];
    const links = [];
    fonts.forEach((font) => {
      const link = document.createElement("link");
      link.href = font;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      links.push(link);
    });
    return () => {
      links.forEach((link) => document.head.removeChild(link));
    };
  }, []);

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
              <th colSpan="2">Internship Supervisor Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3">
                First Name<span className="required-asterisk">*</span>:<br />
                <input 
                  type="text" 
                  id="interneeName" 
                  value={formData.interneeName} 
                  onChange={handleInputChange} 
                  // disabled={!isFieldEditable("interneeName")} 
                  disabled
                />
                {errors.interneeName && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.interneeName}
                  </div>
                )}
              </td>
              <td colSpan="3">
                Name<span className="required-asterisk">*</span>:<br />
                <input
                  type="text"
                  id="workplaceName"
                  value={formData.workplaceName}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable("workplaceName")}
                />
                {errors.workplaceName && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.workplaceName}
                  </div>
                )}
              </td>
              <td colSpan="2">
                Name<span className="required-asterisk">*</span>:<br />
                <input
                  type="text"
                  id="advisorName"
                  value={formData.advisorName}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable("advisorName")}
                />
                {errors.advisorName && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.advisorName}
                  </div>
                )}
              </td>
            </tr>
            <tr>
 
  <td colSpan="3">
    Last Name:<br />
    <input 
      type="text" 
      
    />
    {errors.website && <div style={{ color: "red", fontSize: "0.8rem" }}>{errors.website}</div>}
  </td>

  
  <td colSpan="3">
    Website:<br />
    <input 
      type="text" 
      id="website" 
      value={formData.website} 
      onChange={handleInputChange} 
      disabled={!isFieldEditable("website")} 
    />
    {errors.website && <div style={{ color: "red", fontSize: "0.8rem" }}>{errors.website}</div>}
  </td>

  
  <td colSpan="2">
    Job Title:<br />
    <input 
      type="text" 
      id="advisorJobTitle" 
      value={formData.advisorJobTitle} 
      onChange={handleInputChange} 
      disabled={!isFieldEditable("advisorJobTitle")} 
    />
  </td>
</tr>

            <tr>
              <td colSpan="3">
                Email<span className="required-asterisk">*</span>:<br />
                <input 
                  type="email" 
                  id="interneeEmail" 
                  value={formData.interneeEmail} 
                  onChange={handleInputChange} 
                  disabled
                 
                />
                {errors.interneeEmail && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.interneeEmail}
                  </div>
                )}
              </td>
              <td colSpan="3">
                Phone<span className="required-asterisk">*</span>:<br />
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable("phone")}
                />
                {errors.phone && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.phone}
                  </div>
                )}
              </td>
              <td colSpan="2">
                Email<span className="required-asterisk">*</span>:<br />
                <input
                  type="email"
                  id="advisorEmail"
                  value={formData.advisorEmail}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable("advisorEmail")}
                />
                {errors.advisorEmail && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.advisorEmail}
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                Credit Hours<span className="required-asterisk">*</span>:<br />
                <select
                  id="creditHours"
                  value={formData.creditHours}
                  onChange={handleCreditHourChange}
                  disabled={!isFieldEditable("creditHours")}
                >
                  <option value="">Select Credit Hours</option>
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                </select>
                {errors.creditHours && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.creditHours}
                  </div>
                )}
              </td>
              <td colSpan="3">
                <label htmlFor="startDate">
                  Start Date<span className="required-asterisk">*</span>:
                </label>
                <br />
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable("startDate")}
                  />
                </div>
                {errors.startDate && (
                  <div className="error-text">{errors.startDate}</div>
                )}
              </td>

              <td colSpan="2">
                <label htmlFor="endDate">
                  End Date<span className="required-asterisk">*</span>:
                </label>
                <br />
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable("endDate")}
                  />
                </div>
                {dateError && <div className="error-text">{dateError}</div>}
                {errors.endDate && (
                  <div className="error-text">{errors.endDate}</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="section-title">
          Task Details & Program Outcomes
          <span className="required-asterisk">*</span>
        </h3>
        <div className="table-box">
          <div className="job-description-box">
            <strong>Job Description Details:</strong>
            <ol>
              <li>Tasks need to be filled by the Internship Supervisor.</li>
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
                      style={{
                        width: "100%",
                        padding: "4px",
                        boxSizing: "border-box",
                      }}
                      disabled={!isFieldEditable("task")}
                    />
                  </td>
                  {outcomeLabels.map((label, j) =>
                    renderOutcomeCell(task, label, `${i}-${j}`)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {errors.tasks && (
            <div style={{ color: "red", fontSize: "0.8rem", marginTop: "5px" }}>
              {errors.tasks}
            </div>
          )}
        </div>

        <h3 className="section-title">Signatures:</h3>
        <table>
          <tbody>
            <tr>
              <td className="signature-cell" colSpan="1">
                Internee Signature<span className="required-asterisk">*</span>:<br />
                <div className="signature-field">
                  <SignatureInput
                    id="interneeSignature"
                    value={formData.interneeSignature}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable("interneeSignature")}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.interneeSignature && (
                  <div style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors.interneeSignature}
                  </div>
                )}
              </td>
              </tr>
          </tbody>
        </table>

        {errors.submit && <div className="error-msg">{errors.submit}</div>}

        <div className="submit-section">
          <button type="submit">Submit Form</button>
        </div>
        {successMsg && <div className="success-msg">{successMsg}</div>}
      </form>
    </div>
  );
};

export default A1InternshipRequestForm;
