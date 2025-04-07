import React, { useEffect } from 'react';

const A1InternshipRequestForm = () => {
  useEffect(() => {
    const form = document.getElementById('internshipForm');
    const successMsg = document.getElementById('success-msg');
    const errorMsg = document.getElementById('error-msg');

    const inputs = {
      interneeName: document.getElementById('interneeName'),
      soonerId: document.getElementById('soonerId'),
      interneeEmail: document.getElementById('interneeEmail'),
      workplaceName: document.getElementById('workplaceName'),
      website: document.getElementById('website'),
      phone: document.getElementById('phone'),
      startDate: document.getElementById('startDate'),
      endDate: document.getElementById('endDate'),
      advisorName: document.getElementById('advisorName'),
      advisorJobTitle: document.getElementById('advisorJobTitle'),
      advisorEmail: document.getElementById('advisorEmail'),
      interneeSignature: document.getElementById('interneeSignature'),
      advisorSignature: document.getElementById('advisorSignature'),
      coordinatorApproval: document.getElementById('coordinatorApproval'),
      tasks: document.querySelectorAll('.task'),
      creditHours: document.querySelectorAll('input[name="creditHours"]'),
      outcomes: document.querySelectorAll('.outcome')
    };

    const allInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="date"]');

    allInputs.forEach(input => {
      input.addEventListener('input', () => input.classList.add('touched'));
      input.addEventListener('blur', () => input.classList.add('touched'));
    });

    const creditHourCheckboxes = document.querySelectorAll('.credit-hour');
    creditHourCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          creditHourCheckboxes.forEach(cb => {
            if (cb !== checkbox) cb.checked = false;
          });
        }
      });
    });

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    startDateInput.addEventListener('change', () => {
      if (startDateInput.value) {
        const nextDay = new Date(startDateInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayFormatted = nextDay.toISOString().split('T')[0];
        endDateInput.min = nextDayFormatted;

        if (endDateInput.value && new Date(endDateInput.value) <= new Date(startDateInput.value)) {
          endDateInput.value = '';
        }
      }
    });
    function validateForm() {
      const namePattern = /^[A-Za-z\s]+$/;
      const numberPattern = /^[0-9]+$/;
      const phonePattern = /^[0-9]{10}$/;
      const emailPattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    
      const requiredFieldsFilled =
        inputs.interneeName.value.trim() &&
        inputs.soonerId.value.trim() &&
        inputs.interneeEmail.value.trim() &&
        inputs.workplaceName.value.trim() &&
        inputs.phone.value.trim() &&
        inputs.startDate.value &&
        inputs.endDate.value &&
        inputs.advisorName.value.trim() &&
        inputs.advisorEmail.value.trim() &&
        inputs.interneeSignature.value.trim() &&
        inputs.advisorSignature.value.trim() &&
        inputs.coordinatorApproval.value.trim();
    
      const patternsValid =
        namePattern.test(inputs.interneeName.value.trim()) &&
        numberPattern.test(inputs.soonerId.value.trim()) &&
        emailPattern.test(inputs.interneeEmail.value.trim()) &&
        namePattern.test(inputs.workplaceName.value.trim()) &&
        phonePattern.test(inputs.phone.value.trim()) &&
        namePattern.test(inputs.advisorName.value.trim()) &&
        emailPattern.test(inputs.advisorEmail.value.trim()) &&
        namePattern.test(inputs.interneeSignature.value.trim()) &&
        namePattern.test(inputs.advisorSignature.value.trim()) &&
        namePattern.test(inputs.coordinatorApproval.value.trim());
    
      const creditHoursChecked = Array.from(inputs.creditHours).filter(cb => cb.checked).length === 1;
      const tasksFilled = Array.from(inputs.tasks).every(task => task.value.trim() !== '');
    
      const startDate = new Date(inputs.startDate.value);
      const endDate = new Date(inputs.endDate.value);
      const datesValid = endDate > startDate;
    
      //Check each task row has at least 4 checked outcomes
      const outcomesChecked = (() => {
        const outcomesPerTask = 6; // 6 outcomes per task
        const totalTasks = 5;
    
        for (let i = 0; i < totalTasks; i++) {
          const rowStart = i * outcomesPerTask;
          const rowOutcomes = Array.from(inputs.outcomes).slice(rowStart, rowStart + outcomesPerTask);
          const checkedCount = rowOutcomes.filter(cb => cb.checked).length;
          if (checkedCount < 4) return false; // Not enough outcomes selected
        }
        return true; // All tasks have at least 4 outcomes
      })();
    
      return requiredFieldsFilled && patternsValid && creditHoursChecked && tasksFilled && datesValid && outcomesChecked;
    }    

    form.onsubmit = function (event) {
      event.preventDefault();
      // Extra check for outcome selections
const outcomesPerTask = 6;
let outcomeValidationPassed = true;
for (let i = 0; i < 5; i++) {
  const start = i * outcomesPerTask;
  const rowOutcomes = Array.from(inputs.outcomes).slice(start, start + outcomesPerTask);
  const checkedCount = rowOutcomes.filter(cb => cb.checked).length;
  if (checkedCount < 4) {
    outcomeValidationPassed = false;
    break;
  }
}

if (!outcomeValidationPassed) {
  errorMsg.textContent = "❌ Please select at least 4 Program Outcomes for each task.";
  successMsg.textContent = '';
  return; // Stop submission if the rule is not met
}

const isValid = validateForm();

      if (isValid) {
        successMsg.textContent = "✅ Form submitted successfully!";
        errorMsg.textContent = '';
        getFormValues(inputs);
        setTimeout(() => {
          successMsg.textContent = '';
        }, 3000);
        form.reset();
        allInputs.forEach(i => i.classList.remove('touched'));
      } else {
        errorMsg.textContent = "❌ Please fill all required fields with valid data.";
        successMsg.textContent = '';
        allInputs.forEach(i => i.classList.add('touched'));
      }
    };

    async function getFormValues(inputs){

          // Get all task rows (skip the header rows)
          const taskRows = document.querySelectorAll('table:nth-of-type(2) tr:not(:first-child):not(:nth-child(2)');
        
          // Create a map of outcome positions to their tasks
          const outcomeMap = {
              0: 'problemSolving',     
              1: 'solutionDevelopment', 
              2: 'communication',      
              3: 'decisionMaking',     
              4: 'collaboration',     
              5: 'application'         
          };
  
          // Map tasks to their outcomes
          const tasksWithOutcomes = Array.from(taskRows).map(row => {
          // const description = row.querySelector('.task').value;
          const descriptionInput = row.querySelector('input.task');
          const description = descriptionInput ? descriptionInput.value.trim() : '';
          const outcomeCheckboxes = row.querySelectorAll('.outcome');
          const outcomes = Array.from(outcomeCheckboxes)
          .map((checkbox, index) => ({
              checked: checkbox.checked,
              name: outcomeMap[index]
          }))
          .filter(item => item.checked)
          .map(item => item.name);
  
          return {
          description,
          outcomes
          };
      });
          console.log(tasksWithOutcomes)

     // Getting form data values
      const formData = {
        interneeName: inputs.interneeName.value.trim(),
        soonerId: inputs.soonerId.value.trim(),
        interneeEmail: inputs.interneeEmail.value.trim(),
        workplaceName: inputs.workplaceName.value.trim(),
        website: inputs.website.value.trim(),
        phone: inputs.phone.value.trim(),
        startDate: inputs.startDate.value,
        endDate: inputs.endDate.value,
        advisorName: inputs.advisorName.value.trim(),
        advisorJobTitle: inputs.advisorJobTitle.value.trim(),
        advisorEmail: inputs.advisorEmail.value.trim(),
        interneeSignature: inputs.interneeSignature.value.trim(),
        advisorSignature: inputs.advisorSignature.value.trim(),
        coordinatorApproval: inputs.coordinatorApproval.value.trim(),
        creditHour: Array.from(inputs.creditHours).find(cb => cb.checked)?.value || '',
        tasks: tasksWithOutcomes
        // outcomes: outcomeSelections,
      };

      console.log(formData);
      fetch("http://localhost:5000/api/form/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), 
      })
      .then((res) => res.json())
      .then((data) => console.log("Server response:", data))
      .catch((err) => console.error("Error sending form:", err));
      
    }
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
<h2>A.1 - Internship Request Form</h2>
<h3 class="section-title">Internee & Workplace Information:</h3>
<form id="internshipForm">
  <table>
    <tr>
      <th colspan="3">Internee Details</th>
      <th colspan="3">Workplace Details</th>
      <th colspan="2">Internship Advisor Details</th>
    </tr>
    <tr>
      <td colspan="3">Name:<br><input type="text" id="interneeName" required></td>
      <td colspan="3">Name:<br><input type="text" id="workplaceName" required></td>
      <td colspan="2">Name:<br><input type="text" id="advisorName" required></td>
    </tr>
    <tr>
      <td colspan="3">Sooner ID:<br><input type="text" id="soonerId" required></td>
      <td colspan="3">Website:<br><input type="text" id="website"></td>
      <td colspan="2">Job Title:<br><input type="text" id="advisorJobTitle"></td>
    </tr>
    <tr>
      <td colspan="3">Email:<br><input type="email" id="interneeEmail" required></td>
      <td colspan="3">Phone:<br><input type="text" id="phone" required></td>
      <td colspan="2">Email:<br><input type="email" id="advisorEmail" required></td>
    </tr>
    <tr>
      <td colspan="3" class="signature-cell"><strong>Select the Number of Credit Hours</strong></td>
      <td colspan="3">Start Date:<br><input type="date" id="startDate" required></td>
      <td colspan="2">End Date:<br><input type="date" id="endDate" required></td>
    </tr>
    <tr>
      <td style="text-align:center;">1<br><input type="checkbox" name="creditHours" value="1" class="credit-hour"></td>
      <td style="text-align:center;">2<br><input type="checkbox" name="creditHours" value="2" class="credit-hour"></td>
      <td style="text-align:center;">3<br><input type="checkbox" name="creditHours" value="3" class="credit-hour"></td>
      <td colspan="5"></td>
    </tr>
  </table>

  <h3 class="section-title">Task Details & Program Outcomes:</h3>
  <table>
    <tr>
      <th colspan="2">Job Description Details</th>
      <th colspan="6">Program Outcome</th>
    </tr>
    <tr>
      <td colspan="2">
        <ol>
          <li>Tasks need to be filled by the Internship Advisor.</li>
          <li>Select one or more outcomes per task.</li>
          <li>All tasks must cover at least 4 outcomes.</li>
        </ol>
      </td>
      <th>Problem Solving <span class="description">(Solve complex problems)</span></th>
      <th>Solution Development <span class="description">(Build and assess solutions)</span></th>
      <th>Communication <span class="description">(Communicate effectively)</span></th>
      <th>Decision-Making <span class="description">(Make responsible decisions)</span></th>
      <th>Collaboration <span class="description">(Teamwork skills)</span></th>
      <th>Application <span class="description">(Apply CS concepts)</span></th>
    </tr>
    ${[1, 2, 3, 4, 5].map(i => `
      <tr>
        <td colspan="2">Task ${i}:<br><input type="text" class="task" required></td>
        ${[0, 1, 2, 3, 4, 5].map(j => `<td><input type="checkbox" class="outcome"></td>`).join('')}
      </tr>
    `).join('')}
  </table>

  <h3 class="section-title">Signatures:</h3>
  <table>
    <tr>
      <td class="signature-cell" colspan="3">
        Internee Signature<br>
        <input type="text" id="interneeSignature" placeholder="Enter Full Name" required>
      </td>
      <td class="signature-cell" colspan="3">
        Internship Advisor Signature<br>
        <input type="text" id="advisorSignature" placeholder="Enter Full Name" required>
      </td>
      <td class="signature-cell" colspan="2">
        Internship Coordinator Approval<br>
        <input type="text" id="coordinatorApproval" placeholder="Enter Full Name" required>
      </td>
    </tr>
  </table>

  <div class="submit-section">
    <button type="submit">Submit Form</button>
  </div>
  <div id="success-msg"></div>
  <div id="error-msg"></div>
</form>

<style>
  body { font-family: 'Roboto', sans-serif; margin: 30px; background-color: #f5f5f5; }
  h2 { text-align: center; color: #841617; }
  .section-title { font-size: 16px; color: #841617; margin-top: 30px; margin-bottom: 10px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fff; }
  th { background-color: #841617; color: #fff; }
  th, td { padding: 8px; border: 1px solid #999; vertical-align: top; }
  input[type="text"], input[type="email"], input[type="date"] {
    width: 95%; padding: 6px; font-size: 13px; border: 1px solid #999; border-radius: 3px;
  }
  input[type="checkbox"] {
    appearance: none; width: 16px; height: 16px; border: 2px solid #333;
    border-radius: 50%; background-color: white; cursor: pointer;
  }
  input[type="checkbox"]:checked { background-color: #841617; }
  .signature-cell { text-align: center; background-color: #841617; color: #fff; }
  .signature-cell input { margin-top: 6px; padding: 6px; width: 90%; }
  span.description { font-size: 11.5px; color: #fff; display: block; margin-top: 4px; }
  ol { padding-left: 18px; font-size: 13px; }
  .submit-section { text-align: center; margin-top: 20px; }
  button {
    padding: 10px 25px; background-color: #841617; color: white; border: none;
    font-size: 14px; border-radius: 5px; cursor: pointer;
  }
  button:hover { background-color: #6e1212; }
  #success-msg, #error-msg { text-align: center; font-weight: bold; margin-top: 15px; }
  #success-msg { color: green; }
  #error-msg { color: red; }
</style>

        ` }}
      />
  );
};

export default A1InternshipRequestForm;
