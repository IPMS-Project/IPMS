import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/WeeklyProgressReportForm.css";

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    soonerId: "",
    week: "Week 1",
    hours: "",
    tasks: "",
    lessons: "",
    supervisorComments: "",
  });

  const [submittedHours, setSubmittedHours] = useState(0);
  const [requiredHours, setRequiredHours] = useState(0);
  const [creditHours, setCreditHours] = useState(0);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchStatus = async () => {
    try {
      if (!formData.email) return;

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/reports/status/${formData.soonerId}`
      );
      
      const { requiredHours, submittedHours, creditHours } = res.data;
      setRequiredHours(requiredHours);
      setSubmittedHours(submittedHours);
      setCreditHours(creditHours);
    } catch (err) {
      console.error("Error fetching report status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Only fetch when email is updated
  }, [formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.soonerId ||
      !formData.week ||
      !formData.hours ||
      !formData.tasks ||
      !formData.lessons
    ) {
      setMessage("Please fill in all the required fields.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports`,
        formData
      );

      setMessage(res.data.message || "Report submitted successfully!");

      setFormData({
        fullName: "",
        email: "",
        soonerId: "",
        week: "Week 1",
        hours: "",
        tasks: "",
        lessons: "",
        supervisorComments: "",
      });

      fetchStatus();
    } catch (err) {
      console.error(err);
      setMessage("Submission failed. Try again.");
    }
  };
  
  const handleDownload = () => {
    import('jspdf').then((jsPDFModule) => {
      const jsPDF = jsPDFModule.default;
      
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Use state values directly instead of searching the DOM
      // This will use the current form values
      const studentName = formData.fullName;
      const studentEmail = formData.email;
      const studentId = formData.soonerId;
      
      // Safely get text content from elements by text content for the hour values
      const safeGetValueByText = (textPattern, defaultValue) => {
        try {
          // Look for elements containing the text
          const elements = Array.from(document.querySelectorAll('*'));
          for (const element of elements) {
            if (element.textContent && element.textContent.includes(textPattern)) {
              // Extract the value (assuming format like "Credit Hours: 3")
              const match = element.textContent.match(new RegExp(textPattern + '\\s*:?\\s*(\\d+)'));
              if (match && match[1]) {
                return match[1];
              }
            }
          }
          return defaultValue;
        } catch (e) {
          console.error(`Error finding ${textPattern}:`, e);
          return defaultValue;
        }
      };
      
      // Use the current state values if available, otherwise use the DOM search
      const creditHoursValue = creditHours.toString() || safeGetValueByText('Credit Hours', '3');
      const requiredHoursValue = requiredHours.toString() || safeGetValueByText('Required Hours', '180');
      const submittedHoursValue = submittedHours.toString() || safeGetValueByText('Submitted Hours', '201');
      
      // Add header with color
      doc.setFillColor(165, 0, 33); // Dark red color (similar to the button in your UI)
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("INTERNSHIP PROGRAM MANAGEMENT SYSTEM", pageWidth / 2, 15, { align: 'center' });
      
      // Title
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("A.2 Final Approved Form", pageWidth / 2, 45, { align: 'center' });
      
      // Horizontal line under title
      doc.setDrawColor(165, 0, 33); // Dark red
      doc.setLineWidth(1);
      doc.line(50, 50, pageWidth - 50, 50);
      
      // Student Information section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Student Information", 20, 70);
      
      // Student info box
      doc.setDrawColor(200, 200, 200); // Light gray
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 75, pageWidth - 30, 90, 3, 3); // Increased height to accommodate more details
      
      // Student personal details
      doc.setFontSize(12);
      
      // Name
      doc.setFont('helvetica', 'normal');
      doc.text("Full Name:", 25, 90);
      doc.setFont('helvetica', 'bold');
      doc.text(studentName, 90, 90);
      
      // Email
      doc.setFont('helvetica', 'normal');
      doc.text("Email:", 25, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(studentEmail, 90, 105);
      
      // Sooner ID
      doc.setFont('helvetica', 'normal');
      doc.text("Sooner ID:", 25, 120);
      doc.setFont('helvetica', 'bold');
      doc.text(studentId, 90, 120);
      
      // Hour details
      doc.setFont('helvetica', 'normal');
      doc.text("Credit Hours:", 25, 135);
      doc.setFont('helvetica', 'bold');
      doc.text(creditHoursValue, 90, 135);
      
      doc.setFont('helvetica', 'normal');
      doc.text("Required Hours:", 25, 150);
      doc.setFont('helvetica', 'bold');
      doc.text(requiredHoursValue, 90, 150);
      
      doc.setFont('helvetica', 'normal');
      doc.text("Submitted Hours:", 25, 165);
      doc.setFont('helvetica', 'bold');
      doc.text(submittedHoursValue, 90, 165);
      
      // Completion status with colored background
      doc.setFillColor(230, 250, 230); // Light green
      doc.roundedRect(15, 175, pageWidth - 30, 30, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0); // Dark green
      doc.text("✓ All required internship hours completed!", pageWidth / 2, 193, { align: 'center' });
      
      // Instructions
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text("Please submit this form on Canvas after download.", pageWidth / 2, 215, { align: 'center' });
      
      // Add current date
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${dateStr}`, pageWidth - 20, 240, { align: 'right' });
      
      // Footer
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 270, pageWidth, 25, 'F');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("© 2025 Internship Program Management System", pageWidth / 2, 285, { align: 'center' });
      
      // Save the PDF
      doc.save("formA2.pdf");
    }).catch(error => {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    });
  };

  return (
    <div className="four-week-container">
      <h2 className="four-week-title">A.2 - Weekly Progress Report</h2>

      <form onSubmit={handleSubmit}>
        <label className="four-week-label">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="four-week-input"
          required
        />

        <label className="four-week-label">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="four-week-input"
          required
        />

        <label className="four-week-label">Sooner ID</label>
        <input
          type="text"
          name="soonerId"
          value={formData.soonerId}
          onChange={handleChange}
          className="four-week-input"
          required
        />

        <label className="four-week-label">Logbook Week</label>
        <select
          name="week"
          value={formData.week}
          onChange={handleChange}
          className="four-week-select"
        >
          {Array.from({ length: 15 }, (_, i) => (
            <option key={i} value={`Week ${i + 1}`}>
              Week {i + 1}
            </option>
          ))}
        </select>

        <label className="four-week-label">Number of Hours</label>
        <input
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          className="four-week-input"
          required
          placeholder="e.g., 10"
        />

        <label className="four-week-label">Tasks Performed</label>
        <textarea
          name="tasks"
          value={formData.tasks}
          onChange={handleChange}
          className="four-week-textarea"
          required
        />

        <label className="four-week-label">Lessons Learned</label>
        <textarea
          name="lessons"
          value={formData.lessons}
          onChange={handleChange}
          className="four-week-textarea"
          required
        />

        <label className="four-week-label">Supervisor Comments (optional)</label>
        <textarea
          name="supervisorComments"
          value={formData.supervisorComments}
          onChange={handleChange}
          className="four-week-textarea"
        />

        <button type="submit" className="four-week-button">
          Submit Report
        </button>
      </form>

      <div className="progress-section">
        <p>📚 Credit Hours: <strong>{creditHours}</strong></p>
        <p>⏳ Required Hours: <strong>{requiredHours}</strong></p>
        <p>✅ Submitted Hours: <strong>{submittedHours}</strong></p>

        <progress value={submittedHours} max={requiredHours} style={{ width: "100%" }}></progress>

        {submittedHours >= requiredHours && requiredHours > 0 && (
          <div className="completion-box">
            ✅ All required internship hours completed!
            <br />
            <button className="download-button" onClick={() => handleDownload()}>
              Download Final Approved A.2 Form
            </button>
            <p className="canvas-msg">📎 Please submit this on Canvas after download.</p>
          </div>
        )}
      </div>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default WeeklyProgressReportForm;
