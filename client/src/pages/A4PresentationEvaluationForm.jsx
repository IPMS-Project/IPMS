import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Table,
  Modal,
  Tab,
  Nav,
} from "react-bootstrap";
import "../styles/A3JobEvaluationForm.css";

function A4PresentationEvaluationForm() {
  const initialFormState = {
    interneeName: "",
    interneeID: "",
    interneeEmail: "",
    companyName: "",
    companyWebsite: "",
    companyPhone: "",
    advisorName: "",
    advisorTitle: "",
    advisorEmail: "",
    presentationDate: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({}); //for validation errors

    const validateForm = () => {
      const newErrors = {};
  
      if (!formData.interneeName?.trim()) newErrors.interneeName = "Name is required."; //checks for empty or whitespace only
      if (!/^\d{9}$/.test(formData.interneeID || "")) newErrors.interneeID = "Enter a valid 9-digit Sooner ID."; //checks for exactly 9 digits
      if (!/\S+@\S+\.\S+/.test(formData.interneeEmail || "")) newErrors.interneeEmail = "Invalid email."; //checks that email follows a valid format
      if (!formData.companyName?.trim()) newErrors.companyName = "Company name is required."; //checks for empty or whitespace only
      if (!formData.companyWebsite?.trim()) {
        newErrors.companyWebsite = "Company website is required.";
      } else if (
        !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}([\/\w\.-]*)*\/?$/.test(formData.companyWebsite.trim())
      ) {
        newErrors.companyWebsite = "Enter a valid website (e.g., www.google.com or https://example.com)";
      }
        //above checks both that field is not emmpty and valid website starting from http, https, or www
      if (!/^\d{10}$/.test(formData.companyPhone || "")) newErrors.companyPhone = "Phone number must be 10 digits."; //checks for exactly 10 digits
      if (!formData.advisorName?.trim()) newErrors.advisorName = "Advisor name is required."; //checks for empty or whitespace only
      if (!formData.advisorTitle?.trim()) newErrors.advisorTitle = "Job title is required."; //checks for empty or whitespace only
      if (!/\S+@\S+\.\S+/.test(formData.advisorEmail || "")) newErrors.advisorEmail = "Invalid advisor email."; //checks that email follows a valid format
      if (!formData.presentationDate) newErrors.presentationDate = "Presentation date is required."; //checks that a date was selected
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      console.warn("Form validation failed.");
      return;
    }
  
    console.log("Form submitted successfully.");
    console.log("Submitted Data:", formData);
  
    alert("Form submitted!");
    
    setFormData(initialFormState); //initialize back to blank
  };

  return (
    <div className="page-content">
      <h2 className="heading-maroon">
        A.4 – Internship Coordinator Presentation Evaluation Form
      </h2>
      <Container
  className="p-4 rounded shadow-lg"
  style={{
    backgroundColor: "#fff",
    maxWidth: "100%",
    minWidth: "1100px",   // or 1200px if needed
    width: "100%",
    overflowX: "auto"
  }}
      >
        <Form onSubmit={handleSubmit}>
            <Row className="d-flex flex-nowrap">
            {/* Internee Details */}
            <Col style={{ minWidth: "300px" }}>
            <div style={{ border: "2px solid #333", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <h5>Internee Details</h5>
              <Form.Group controlId="interneeName">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={formData.interneeName}
                  onChange={(e) => handleChange("interneeName", e.target.value)}
                  isInvalid={!!errors.interneeName} 
                  />
                  {errors.interneeName && (
                  <Form.Text className="text-danger">{errors.interneeName}</Form.Text>
                  )}
              </Form.Group>
              <Form.Group controlId="interneeID">
                <Form.Label>Sooner ID:</Form.Label>
                <Form.Control
                    type="text"
                    pattern="\d{9}"
                    maxLength={9}
                    placeholder="Enter 9-digit student ID"
                    className="form-control"
                    value={formData.interneeID}
                    onChange={(e) => handleChange("interneeID", e.target.value)}
                    isInvalid={!!errors.interneeID}
                    />
                    {errors.interneeID && (
                    <Form.Text className="text-danger">{errors.interneeID}</Form.Text>
                   )}
              </Form.Group>
              <Form.Group controlId="interneeEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter student email"
                  value={formData.interneeEmail}
                  onChange={(e) => handleChange("interneeEmail", e.target.value)}
                  isInvalid={!!errors.interneeEmail} 
                  />
                  {errors.interneeEmail && (
                  <Form.Text className="text-danger">{errors.interneeEmail}</Form.Text>
                  )}
              </Form.Group>
              </div>
            </Col>

            {/* Workplace Details */}
            <Col style={{ minWidth: "300px" }}>
            <div style={{ border: "2px solid #333", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <h5>Workplace Details</h5>
              <Form.Group controlId="companyName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  isInvalid={!!errors.companyName} 
                  />
                  {errors.companyName && (
                  <Form.Text className="text-danger">{errors.companyName}</Form.Text>
                  )}
              </Form.Group>
              <Form.Group controlId="companyWebsite">
                <Form.Label>Company Website</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter company website"
                    className="form-control"
                    value={formData.companyWebsite}
                    onChange={(e) => handleChange("companyWebsite", e.target.value)}
                    isInvalid={!!errors.companyWebsite}
                  />
                  {errors.companyWebsite && (
                    <Form.Text className="text-danger">{errors.companyWebsite}</Form.Text>
                  )}
              </Form.Group>
              <Form.Group controlId="companyPhone">
                <Form.Label>Phone:</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter 10-digit phone number"
                    className="form-control"
                    pattern="\d{10}"
                    maxLength={10}
                    value={formData.companyPhone}
                    onChange={(e) => handleChange("companyPhone", e.target.value)}
                    isInvalid={!!errors.companyPhone} 
                    />
                    {errors.companyPhone && (
                    <Form.Text className="text-danger">{errors.companyPhone}</Form.Text>
                    )}
              </Form.Group>
              </div>
            </Col>

            {/* Internship Advisor Details */}
            <Col style={{ minWidth: "300px" }}>
            <div style={{ border: "2px solid #333", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <h5>Internship Advisor Details</h5>
              <Form.Group controlId="advisorName">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter advisor's name"
                  value={formData.advisorName}
                  onChange={(e) => handleChange("advisorName", e.target.value)}
                  isInvalid={!!errors.advisorName} 
                  />
                  {errors.advisorName && (
                  <Form.Text className="text-danger">{errors.advisorName}</Form.Text>
                  )}
              </Form.Group>
              <Form.Group controlId="advisorTitle">
                <Form.Label>Job Title:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter advisor's job title"
                  value={formData.advisorTitle}
                  onChange={(e) => handleChange("advisorTitle", e.target.value)}
                  isInvalid={!!errors.advisorTitle} 
                  />
                  {errors.advisorTitle && (
                  <Form.Text className="text-danger">{errors.advisorTitle}</Form.Text>
                  )}
              </Form.Group>
              <Form.Group controlId="advisorEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter advisor's email"
                  value={formData.advisorEmail}
                  onChange={(e) =>
                    handleChange("advisorEmail", e.target.value)
                  }
                  isInvalid={!!errors.advisorEmail} 
                  />
                  {errors.advisorEmail && (
                  <Form.Text className="text-danger">{errors.advisorEmail}</Form.Text>
                  )}
              </Form.Group>
              </div>
            </Col>
          </Row>

          {/* Presentation Date */}
          <Row className="mt-4">
          <div style={{ border: "2px solid #333", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <Col md={6}>
              <Form.Group controlId="presentationDate">
                <Form.Label>Presentation Date:</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.presentationDate}
                  style={{ width: "200px", fontSize: "14px" }}
                  onChange={(e) =>
                    handleChange("presentationDate", e.target.value)
                  }
                  isInvalid={!!errors.presentationDate}
                  />
                {errors.presentationDate && (
                  <Form.Text className="text-danger">{errors.presentationDate}</Form.Text>
                )}
              </Form.Group>
            </Col>
            </div>
          </Row>

          <Button variant="primary" type="submit" className="mt-3">
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default A4PresentationEvaluationForm;