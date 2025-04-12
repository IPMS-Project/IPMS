import React, { useState } from 'react';
import '../styles/A1InternshipRequestForm.css'; 

const A1InternshipRequestForm = () => {
  const initialState = {
    interneeName: '',
    soonerId: '',
    interneeEmail: '',
    workplaceName: '',
    website: '',
    phone: '',
    startDate: '',
    endDate: '',
    advisorName: '',
    advisorJobTitle: '',
    advisorEmail: '',
    interneeSignature: '',
    advisorSignature: '',
    coordinatorApproval: '',
    creditHours: '',
    tasks: ['', '', '', '', ''],
    outcomes: Array(5).fill(Array(6).fill(false)),
  };

  const [formData, setFormData] = useState(initialState);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dateError, setDateError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear date error when either date field changes
    if (id === 'startDate' || id === 'endDate') {
      setDateError('');
      
      // Validate dates when both are filled
      if (formData.startDate && formData.endDate) {
        validateDates(id === 'startDate' ? value : formData.startDate, 
                     id === 'endDate' ? value : formData.endDate);
      }
    }
  };

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (endDate <= startDate) {
      setDateError('End date must be after start date');
    } else {
      setDateError('');
    }
  };

  const handleCreditHourChange = (value) => {
    setFormData((prev) => ({ ...prev, creditHours: value }));
  };

  const handleTaskChange = (index, value) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = value;
    setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
  };

  const handleOutcomeChange = (taskIndex, outcomeIndex) => {
    const updatedOutcomes = formData.outcomes.map((row, i) =>
      i === taskIndex
        ? row.map((val, j) => (j === outcomeIndex ? !val : val))
        : row
    );
    setFormData((prev) => ({ ...prev, outcomes: updatedOutcomes }));
  };

  const validateForm = () => {
    const namePattern = /^[A-Za-z\s]+$/;
    const numberPattern = /^[0-9]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;

    const {
      interneeName, soonerId, interneeEmail, workplaceName, phone,
      startDate, endDate, advisorName, advisorEmail,
      interneeSignature, advisorSignature, coordinatorApproval,
      creditHours, tasks,
    } = formData;

    const requiredFieldsFilled = interneeName && soonerId && interneeEmail &&
      workplaceName && phone && startDate && endDate &&
      advisorName && advisorEmail && interneeSignature &&
      advisorSignature && coordinatorApproval && creditHours;

    const patternsValid = namePattern.test(interneeName) &&
      numberPattern.test(soonerId) &&
      emailPattern.test(interneeEmail) &&
      namePattern.test(workplaceName) &&
      phonePattern.test(phone) &&
      namePattern.test(advisorName) &&
      emailPattern.test(advisorEmail) &&
      namePattern.test(interneeSignature) &&
      namePattern.test(advisorSignature) &&
      namePattern.test(coordinatorApproval);

    // const tasksFilled = tasks.every(task => task.trim() !== '');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const datesValid = end > start;

    if (!datesValid) {
      setDateError('End date must be after start date');
      return false;
    }

    // const outcomesValid = outcomes.every(taskOutcomes =>
    //   taskOutcomes.filter(val => val).length >= 4
    // );

    const outcomesValid = new Set(tasks.map((task, i) => [task, formData.outcomes[i]]) // zip tasks and outcomes
      .filter(pair => pair[0].trim() !== '') // ignore empty tasks
      .map(pair => pair[1].flatMap((outcome, i) => outcome ? i : [])) // retrieve each task's outcomes (each outcome is a boolean and the flat map gets true outcomes' indices)
      .flat()).size >= 3; // merge per-task outcomes, count at least 3
    // console.log(`nonempty tasks: ${tasks.filter(task => task.trim() !== '')}`);
    const tasksFilled = tasks.filter(task => task.trim() !== '').length >= 3;

    // return requiredFieldsFilled && patternsValid && tasksFilled && datesValid && outcomesValid;

    
    return requiredFieldsFilled && patternsValid && tasksFilled && datesValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      setSuccessMsg('Form submitted successfully!');
      setErrorMsg('');
      submitFormData(formData)
      .then(response => {
        if (response.status === "pending manual review") {
          alert("Form sent to coordinator for manual review.");
        } else if (response.status === "submitted") {
          alert("Form sent to supervisor.");
        }
      })
      .catch(err => {
        console.error(err);
        alert(`Something went wrong with the submission!\n${err}`);
      });
      setTimeout(() => setSuccessMsg(''), 3000);
      setFormData(initialState);
    } else {
      setErrorMsg('Please fill all required fields with valid data. Minimum of three tasks are required to be filled.');
      setSuccessMsg('');
    }
  };
  const submitFormData = async () => {
    const BASE_URL=process.env.REACT_APP_API_URL
    const outcomeMap = {
      0: 'problemSolving',
      1: 'solutionDevelopment',
      2: 'communication',
      3: 'decisionMaking',
      4: 'collaboration',
      5: 'application'
    };

    const tasksWithOutcomes = formData.tasks.map((taskDesc, i) => {
      const selectedOutcomes = formData.outcomes[i]
        .map((checked, j) => (checked ? outcomeMap[j] : null))
        .filter(Boolean);
      return {
        description: taskDesc.trim(),
        outcomes: selectedOutcomes
      };
    });

    const payload = {
      interneeName: formData.interneeName.trim(),
      soonerId: formData.soonerId.trim(),
      interneeEmail: formData.interneeEmail.trim(),
      workplaceName: formData.workplaceName.trim(),
      website: formData.website.trim(),
      phone: formData.phone.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      advisorName: formData.advisorName.trim(),
      advisorJobTitle: formData.advisorJobTitle.trim(),
      advisorEmail: formData.advisorEmail.trim(),
      interneeSignature: formData.interneeSignature.trim(),
      advisorSignature: formData.advisorSignature.trim(),
      coordinatorApproval: formData.coordinatorApproval.trim(),
      creditHour: formData.creditHours,
      tasks: tasksWithOutcomes
    };

    try {
      const response = await fetch(`${BASE_URL}/api/form/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
       return response.json();
        } catch (err) {
    console.error(err);
  }

  // try {
  //   const response = await axios.post("http://localhost:5001/api/form/submit", payload);

  //   if (response.data.status === "pending for manual review") {
  //     navigate("coordinator-dashboard");
  //   } else {
  //     navigate("/supervisor-dashboard");
  //   }
  // } catch (err) {
  //   console.error("Form submission failed:", err);
  // }
};

      
  return (
    <div className="form-container">
      <h2>A.1 - Internship Request Form</h2>
      <h3 className="section-title">Internee & Workplace Information:</h3>
      <form onSubmit={handleSubmit}>
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
              <td colSpan="3">Name:<br /><input type="text" id="interneeName" value={formData.interneeName} onChange={handleInputChange} /></td>
              <td colSpan="3">Name:<br /><input type="text" id="workplaceName" value={formData.workplaceName} onChange={handleInputChange} /></td>
              <td colSpan="2">Name:<br /><input type="text" id="advisorName" value={formData.advisorName} onChange={handleInputChange} /></td>
            </tr>
            <tr>
              <td colSpan="3">Sooner ID:<br /><input type="text" id="soonerId" value={formData.soonerId} onChange={handleInputChange} /></td>
              <td colSpan="3">Website:<br /><input type="text" id="website" value={formData.website} onChange={handleInputChange} /></td>
              <td colSpan="2">Job Title:<br /><input type="text" id="advisorJobTitle" value={formData.advisorJobTitle} onChange={handleInputChange} /></td>
            </tr>
            <tr>
              <td colSpan="3">Email:<br /><input type="email" id="interneeEmail" value={formData.interneeEmail} onChange={handleInputChange} /></td>
              <td colSpan="3">Phone:<br /><input type="text" id="phone" value={formData.phone} onChange={handleInputChange} /></td>
              <td colSpan="2">Email:<br /><input type="email" id="advisorEmail" value={formData.advisorEmail} onChange={handleInputChange} /></td>
            </tr>
            <tr>
              <td colSpan="3" className="signature-cell"><strong>Select the Number of Credit Hours</strong></td>
              <td colSpan="3">
                Start Date:<br />
                <input 
                  type="date" 
                  id="startDate" 
                  value={formData.startDate} 
                  onChange={handleInputChange} 
                />
              </td>
              <td colSpan="2">
                End Date:<br />
                <input 
                  type="date" 
                  id="endDate" 
                  value={formData.endDate} 
                  onChange={handleInputChange} 
                />
                {dateError && <div className="date-error" style={{ color: 'red', fontSize: '0.8rem' }}>{dateError}</div>}
              </td>
            </tr>
            <tr>
              {[1, 2, 3].map((val) => (
                <td key={val} style={{ textAlign: 'center' }}>
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

        {/* Tasks and Outcomes Section */}
        <h3 className="section-title">Task Details & Program Outcomes:</h3>
        <table>
          <thead>
            <tr>
              <th colSpan="2">Job Description Details</th>
              <th colSpan="6">Program Outcome</th>
            </tr>
            <tr>
              <td colSpan="2">
                <ol>
                  <li>Tasks need to be filled by the Internship Advisor.</li>
                  <li>Select one or more outcomes per task.</li>
                  <li>All tasks must cover at least 4 outcomes.</li>
                </ol>
              </td>
              <th>Problem Solving</th>
              <th>Solution Development</th>
              <th>Communication</th>
              <th>Decision-Making</th>
              <th>Collaboration</th>
              <th>Application</th>
            </tr>
          </thead>
          <tbody>
            {formData.tasks.map((task, i) => (
              <tr key={i}>
                <td colSpan="2">
                  Task {i + 1}:<br />
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(i, e.target.value)}
                    className="task"
                  />
                </td>
                {formData.outcomes[i].map((outcome, j) => (
                  <td key={j}>
                    <input
                      type="checkbox"
                      checked={outcome}
                      onChange={() => handleOutcomeChange(i, j)}
                      className="outcome"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <h3 className="section-title">Signatures:</h3>
        <table>
          <tbody>
            <tr>
              <td className="signature-cell" colSpan="3">
                Internee Signature<br />
                <input
                  type="text"
                  id="interneeSignature"
                  value={formData.interneeSignature}
                  onChange={handleInputChange}
                />
              </td>
              <td className="signature-cell" colSpan="3">
                Internship Advisor Signature<br />
                <input
                  type="text"
                  id="advisorSignature"
                  value={formData.advisorSignature}
                  onChange={handleInputChange}
                />
              </td>
              <td className="signature-cell" colSpan="2">
                Internship Coordinator Approval<br />
                <input
                  type="text"
                  id="coordinatorApproval"
                  value={formData.coordinatorApproval}
                  onChange={handleInputChange}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="submit-section">
          <button type="submit">Submit Form</button>
        </div>
        {successMsg && <div className="success-msg">{successMsg}</div>}
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
      </form>
    </div>
  );
};

export default A1InternshipRequestForm;