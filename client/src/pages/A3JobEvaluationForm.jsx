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
import SignatureCanvas from "react-signature-canvas";
import "../styles/A3JobEvaluationForm.css";

// Fonts used for styled signature typing
const fonts = [
  "Pacifico",
  "Indie Flower",
  "Dancing Script",
  "Great Vibes",
  "Satisfy",
];

// Evaluation criteria items
const evaluationItems = [
  "Task Execution and Quality",
  "Initiative and Proactiveness",
  "Communication and Collaboration",
  "Time Management and Dependability",
  "Problem Solving and Critical Thinking",
  "Creativity and Innovation",
  "Technical and Industry Specific Skills",
  "Work Ethic and Cultural Fit",
  "Feedback Reception and Implementation",
];

const A3JobEvaluationForm = () => {
  // Form state management
  const [formData, setFormData] = useState({
    interneeName: "",
    interneeID: "",
    interneeEmail: "",
    advisorSignature: "",
    advisorAgreement: false,
    coordinatorSignature: "",
    coordinatorAgreement: false,
  });
  // const [advisorDetails, setAdvisorDetails] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Ratings and comments
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeSignatureTarget, setActiveSignatureTarget] = useState("advisor");
  const [typedSignatures, setTypedSignatures] = useState({
    advisor: "",
    coordinator: "",
  });
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const [activeTab, setActiveTab] = useState("type");

  // For validation of the form contents
  const validateForm = () => {
    const newErrors = {};
    if (!formData.interneeName?.trim()) newErrors.interneeName = "Name is required.";
    if (!/^\d{9}$/.test(formData.interneeID || "")) newErrors.interneeID = "Enter a valid 9-digit Sooner ID.";
    if (!/\S+@\S+\.\S+/.test(formData.interneeEmail || "")) newErrors.interneeEmail = "Invalid email.";
    if (!formData.advisorSignature) newErrors.advisorSignature = "Signature is required.";
    if (!formData.coordinatorSignature) newErrors.coordinatorSignature = "Signature is required.";
    evaluationItems.forEach((item) => {
      if (!ratings[item]) {
        newErrors[`${item}_rating`] = "Please select one of these"; // Error message
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Signature canvas ref
  const sigCanvasRef = useRef(null);

  // Clear typed signature if tab switches to "type"
  useEffect(() => {
    if (activeTab === "type") {
      setTypedSignatures((prev) => ({ ...prev, [activeSignatureTarget]: "" }));
    }
  }, [activeSignatureTarget, showModal, activeTab]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Rating selection
  const handleRatingChange = (item, value) => {
    setRatings((prev) => ({ ...prev, [item]: value }));
  };

  // Comment box
  const handleCommentChange = (item, value) => {
    setComments((prev) => ({ ...prev, [item]: value }));
  };

  // Handle inserting signature from modal
  const handleSignatureInsert = () => {
    const targetField =
      activeSignatureTarget === "advisor"
        ? "advisorSignature"
        : "coordinatorSignature";
    if (activeTab === "type" && typedSignatures[activeSignatureTarget].trim()) {
      //handleChange(targetField, JSON.stringify({ type: 'text', value: typedSignatures[activeSignatureTarget], font: selectedFont }));
      handleChange(targetField, {
        type: "text",
        value: typedSignatures[activeSignatureTarget],
        font: selectedFont,
      });
      setShowModal(false);
    } else if (activeTab === "draw") {
      const canvas = sigCanvasRef.current;
      if (canvas && !canvas.isEmpty()) {
        let trimmedCanvas;
        try {
          trimmedCanvas = canvas.getTrimmedCanvas();
        } catch (err) {
          console.warn("getTrimmedCanvas() failed, using full canvas instead.");
          trimmedCanvas = canvas.getCanvas();
        }
        const signatureData = trimmedCanvas.toDataURL("image/png");
        //handleChange(targetField, JSON.stringify({ type: 'draw', value: signatureData }));
        handleChange(targetField, { type: "draw", value: signatureData });
        setShowModal(false);
      } else {
        alert("Please draw your signature before inserting.");
      }
    }
  };

  // Submit the form to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !formData.advisorAgreement || !formData.coordinatorAgreement) {
      alert("Please confirm internee details and both signature agreements before submitting.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/evaluation`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interneeName: formData.interneeName,
            interneeID: formData.interneeID,
            interneeEmail: formData.interneeEmail,
            advisorSignature: formData.advisorSignature,
            coordinatorSignature: formData.coordinatorSignature,
            advisorAgreement: formData.advisorAgreement,
            coordinatorAgreement: formData.coordinatorAgreement,
            ratings,
            comments,
          }),
        }
      );
      if (response.ok) {
        alert("Evaluation submitted successfully!");
        setFormData({
          interneeName: "", 
          interneeID: "",
          interneeEmail: "",
          advisorName: "",
          advisorJobTitle: "",
          advisorEmail: "",
          advisorSignature: "",
          advisorAgreement: false,
          coordinatorSignature: "",
          coordinatorAgreement: false,
        });
        setRatings({});
        setComments({});
        setTypedSignatures({ advisor: "", coordinator: "" });
        sigCanvasRef.current?.clear();
      } else {
        const err = await response.json();
        console.error("Backend returned error:", err);
        alert(`Submission failed: ${err.error}`);
      }
    } catch (err) {
      alert("Server error. Please try again.");
      console.error(err);
    }
  };

  // Show preview of signature (text or image)
  const renderSignaturePreview = (field) => {
    if (!formData[field]) {
      return <span style={{ color: "gray" }}>Click to sign</span>;
    }

    let sig = formData[field];
    if (typeof sig === "string") {
      try {
        sig = JSON.parse(sig);
      } catch (err) {
        return <span style={{ color: "gray" }}>Invalid signature format</span>;
      }
    }

    if (sig.type === "draw") {
      return (
        <img src={sig.value} alt="Signature" style={{ maxHeight: "40px" }} />
      );
    }
    if (sig.type === "text") {
      return (
        <span style={{ fontFamily: sig.font, fontSize: "24px" }}>
          {sig.value}
        </span>
      );
    }

    return <span style={{ color: "gray" }}>Unknown signature type</span>;
  };

  return (
    <div className="page-content">
      <h2 className="heading-maroon">A.3 – Job Performance Evaluation</h2>
      <Container
        className="p-4 rounded shadow-lg" 
        style={{ backgroundColor: "#fff", maxWidth: "900px", width: "100%" }}
      >
        <Form onSubmit={handleSubmit}>
          <Row className="justify-content-center" style={{ marginBottom: "20px" }}>
            <Col xs={12}> 
            <div className="border-box">
              <h5 style={{ backgroundColor: '#9d2235', color: 'white', padding: '8px', borderRadius: '5px', textAlign: "center", width: '100%',}}>Internee Details</h5>
                <Form.Group controlId="interneeName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={formData.interneeName} onChange={(e) => handleChange("interneeName", e.target.value)} isInvalid={!!errors.interneeName} placeholder="Enter full name" style={{ maxWidth: "300px" }}/>
                  <Form.Text className="text-danger">{errors.interneeName}</Form.Text>
                </Form.Group>
                <Form.Group controlId="interneeID">
                  <Form.Label>Sooner ID</Form.Label>
                  <Form.Control type="text" maxLength={9} value={formData.interneeID} onChange={(e) => handleChange("interneeID", e.target.value)} isInvalid={!!errors.interneeID} placeholder="Enter 9-digit student ID" style={{ maxWidth: "300px" }}/>
                  <Form.Text className="text-danger">{errors.interneeID}</Form.Text>
                </Form.Group>
                <Form.Group controlId="interneeEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formData.interneeEmail} onChange={(e) => handleChange("interneeEmail", e.target.value)} isInvalid={!!errors.interneeEmail}  placeholder="Enter student email" style={{ maxWidth: "300px" }}/>
                  <Form.Text className="text-danger">{errors.interneeEmail}</Form.Text>
                  </Form.Group>
            </div>
            <div className="border-box mt-4">
                <h5 style={{ backgroundColor: '#9d2235', color: 'white', padding: '8px', borderRadius: '5px', textAlign: "center", width: '100%' }}> Internship Advisor Details </h5>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={formData.advisorName} readOnly style={{ maxWidth: "300px" }} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control type="text" value={formData.advisorJobTitle} readOnly style={{ maxWidth: "300px" }} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formData.advisorEmail} readOnly style={{ maxWidth: "300px" }} />
                  </Form.Group>
            </div>
          </Col>
          </Row>
          
          <Table bordered responsive className="text-center custom-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Satisfactory</th>
                <th>Unsatisfactory</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {evaluationItems.map((item, index) => (
                <tr key={item}>
                <td>{item}</td>
                
                {/* Radios grouped in one cell */}
                <td colSpan={2}>
                  <div className="d-flex gap-4 align-items-center">
                    <Form.Check
                      type="radio"
                      id={`satisfactory-${index}`}
                      name={`item-${index}`}
                      label="Satisfactory"
                      value="Satisfactory"
                      checked={ratings[item] === "Satisfactory"}
                      onChange={() => handleRatingChange(item, "Satisfactory")}
                      isInvalid={!!errors[`${item}_rating`]}
                    />
                    <Form.Check
                      type="radio"
                      id={`unsatisfactory-${index}`}
                      name={`item-${index}`}
                      label="Unsatisfactory"
                      value="Unsatisfactory"
                      checked={ratings[item] === "Unsatisfactory"}
                      onChange={() => handleRatingChange(item, "Unsatisfactory")}
                      isInvalid={!!errors[`${item}_rating`]}
                    />
                  </div>
                  
                  {/* Show the error below both radio buttons */}
                  {errors[`${item}_rating`] && (
                    <Form.Control.Feedback type="invalid" className="d-block mt-1">
                      {errors[`${item}_rating`]}
                    </Form.Control.Feedback>
                  )}
                </td>
              
                {/* Comments box */}
                <td>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={comments[item] || ""}
                    onChange={(e) => handleCommentChange(item, e.target.value)}
                    placeholder="Enter comments"
                    style={{ minWidth: "250px" }}
                  />
                </td>
              </tr>
              ))}
            </tbody>
          </Table>

          {/* Signature section */}
          <Row className="mb-4">
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Internship Advisor Signature</Form.Label>
                <div
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #ccc",
                    minHeight: "40px",
                    padding: "6px 0",
                  }}
                  onClick={() => {
                    setActiveSignatureTarget("advisor");
                    setShowModal(true);
                  }}
                >
                  {renderSignaturePreview("advisorSignature")}
                </div>
                <Form.Text className="text-danger">{errors.advisorSignature}</Form.Text>
                <Form.Check
                  type="checkbox"
                  className="mt-2"
                  label="I agree that by typing/drawing my name, I am electronically signing this document."
                  checked={formData.advisorAgreement}
                  onChange={(e) =>
                    handleChange("advisorAgreement", e.target.checked)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Internship Coordinator Signature</Form.Label>
                <div
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #ccc",
                    minHeight: "40px",
                    padding: "6px 0",
                  }}
                  onClick={() => {
                    setActiveSignatureTarget("coordinator");
                    setShowModal(true);
                  }}
                >
                  {renderSignaturePreview("coordinatorSignature")}
                </div>
                <Form.Text className="text-danger">{errors.coordinatorSignature}</Form.Text>
                <Form.Check
                  type="checkbox"
                  className="mt-2"
                  label="I agree that by typing/drawing my name, I am electronically signing this document."
                  checked={formData.coordinatorAgreement}
                  onChange={(e) =>
                    handleChange("coordinatorAgreement", e.target.checked)
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Submit button */}
          <div className="text-center">
            <Button
              type="submit"
              className="px-5 text-white"
              style={{ backgroundColor: "#9d2235", borderColor: "#9d2235" }}
            >
              Submit Evaluation
            </Button>
          </div>
        </Form>
      </Container>

      {/* Signature Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="custom-signature-modal"
      >
        <Modal.Body
          className="rounded shadow bg-white p-4"
          style={{ border: "none", borderRadius: "16px" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Sign Here</h5>
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              ✕
            </Button>
          </div>
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="type">Type in</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="draw">Draw by hand</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="type">
                <Form.Control
                  type="text"
                  placeholder="Your name"
                  value={typedSignatures[activeSignatureTarget]}
                  onChange={(e) =>
                    setTypedSignatures((prev) => ({
                      ...prev,
                      [activeSignatureTarget]: e.target.value,
                    }))
                  }
                  className="mb-3"
                />
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {fonts.map((font) => (
                    <div
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      style={{
                        cursor: "pointer",
                        fontFamily: font,
                        padding: "10px 15px",
                        border:
                          font === selectedFont
                            ? "2px solid #9d2235"
                            : "1px solid #ccc",
                        borderRadius: "10px",
                        fontSize: "24px",
                        backgroundColor: "#fff",
                      }}
                    >
                      {typedSignatures[activeSignatureTarget] || "Your name"}
                    </div>
                  ))}
                </div>
                <div className="text-end mt-3">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "#9d2235",
                      borderColor: "#9d2235",
                    }}
                    onClick={handleSignatureInsert}
                  >
                    ✓
                  </Button>
                </div>
              </Tab.Pane>

              {/* Draw tab */}
              <Tab.Pane eventKey="draw">
                <div className="signature-canvas-container position-relative rounded border shadow-sm p-3 bg-light">
                  <div className="position-absolute start-0 top-0 bg-warning px-3 py-1 rounded-end">
                    Draw here
                  </div>
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor="black"
                    canvasProps={{
                      width: 500,
                      height: 150,
                      className: "sigCanvas w-100 rounded border",
                    }}
                  />
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => sigCanvasRef.current?.clear()}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: "#9d2235",
                        borderColor: "#9d2235",
                      }}
                      onClick={handleSignatureInsert}
                    >
                      ✓
                    </Button>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default A3JobEvaluationForm;
