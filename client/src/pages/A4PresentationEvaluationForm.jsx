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

const fonts = ["Pacifico", "Indie Flower", "Dancing Script", "Great Vibes", "Satisfy"];

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
    "Presentation Content_rating": "",
    "Presentation Content_comments": "",
    "Delivery and Communication_rating": "",
    "Delivery and Communication_comments": "",
    "Answering Questions_rating": "",
    "Answering Questions_comments": "",
    coordinatorSignature: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const [activeTab, setActiveTab] = useState("type");
  const sigCanvasRef = useRef(null);

  useEffect(() => {
    if (activeTab === "type") setTypedSignature("");
  }, [activeTab]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.interneeName?.trim()) newErrors.interneeName = "Name is required.";
    if (!/^\d{9}$/.test(formData.interneeID || "")) newErrors.interneeID = "Enter a valid 9-digit Sooner ID.";
    if (!/\S+@\S+\.\S+/.test(formData.interneeEmail || "")) newErrors.interneeEmail = "Invalid email.";
    if (!formData.companyName?.trim()) newErrors.companyName = "Company name is required.";
    if (!formData.companyWebsite?.trim()) {
      newErrors.companyWebsite = "Company website is required.";
    } else if (!/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([/\w.-]*)*\/?$/.test(formData.companyWebsite.trim())) {
      newErrors.companyWebsite = "Enter a valid website.";
    }
    if (!/^\d{10}$/.test(formData.companyPhone || "")) newErrors.companyPhone = "Phone must be 10 digits.";
    if (!formData.advisorName?.trim()) newErrors.advisorName = "Advisor name is required.";
    if (!formData.advisorTitle?.trim()) newErrors.advisorTitle = "Job title is required.";
    if (!/\S+@\S+\.\S+/.test(formData.advisorEmail || "")) newErrors.advisorEmail = "Invalid advisor email.";
    if (!formData.presentationDate) newErrors.presentationDate = "Presentation date is required.";
    if (!formData.coordinatorSignature) newErrors.coordinatorSignature = "Signature is required.";
    ["Presentation Content", "Delivery and Communication", "Answering Questions"].forEach((item) => {
      if (!formData[`${item}_rating`]) {
        newErrors[`${item}_rating`] = `${item} rating is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSignatureInsert = () => {
    if (activeTab === "type" && typedSignature.trim()) {
      handleChange("coordinatorSignature", {
        type: "text",
        value: typedSignature,
        font: selectedFont,
      });
      setShowModal(false);
    } else if (activeTab === "draw") {
      const canvas = sigCanvasRef.current;
      if (canvas && !canvas.isEmpty()) {
        let trimmedCanvas;
        try {
          trimmedCanvas = canvas.getTrimmedCanvas();
        } catch {
          trimmedCanvas = canvas.getCanvas();
        }
        const image = trimmedCanvas.toDataURL("image/png");
        handleChange("coordinatorSignature", { type: "draw", value: image });
        setShowModal(false);
      } else {
        alert("Please draw your signature before inserting.");
      }
    }
  };

  const renderSignaturePreview = () => {
    const sig = formData.coordinatorSignature;
    if (!sig) return <span style={{ color: "gray" }}>Click to sign</span>;
    if (sig.type === "draw") return <img src={sig.value} alt="Signature" style={{ maxHeight: "40px" }} />;
    if (sig.type === "text") return <span style={{ fontFamily: sig.font, fontSize: "24px" }}>{sig.value}</span>;
    return <span style={{ color: "gray" }}>Invalid signature</span>;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    alert("Form submitted!");
    console.log(formData);
    setFormData(initialFormState);
    setTypedSignature("");
    sigCanvasRef.current?.clear();
  };

  return (
    <div className="page-content" >
      <h2 className="heading-maroon">A.4 – Internship Coordinator Presentation Evaluation Form</h2>
      <Container className="p-4 rounded shadow-lg" style={{ backgroundColor: "#fff", minWidth: "1100px" }}>
        <Form onSubmit={handleSubmit}>
          <Row className="d-flex flex-nowrap">
            <Col style={{ minWidth: "300px" }}>
              <div className="border-box">
                <h5 style={{ backgroundColor: '#9d2235', color: 'white', padding: '8px', borderRadius: '5px' }}>Internee Details</h5>
                <Form.Group controlId="interneeName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={formData.interneeName} onChange={(e) => handleChange("interneeName", e.target.value)} isInvalid={!!errors.interneeName} placeholder="Enter full name" />
                  <Form.Text className="text-danger">{errors.interneeName}</Form.Text>
                </Form.Group>
                <Form.Group controlId="interneeID">
                  <Form.Label>Sooner ID</Form.Label>
                  <Form.Control type="text" maxLength={9} value={formData.interneeID} onChange={(e) => handleChange("interneeID", e.target.value)} isInvalid={!!errors.interneeID} placeholder="Enter 9-digit student ID"/>
                  <Form.Text className="text-danger">{errors.interneeID}</Form.Text>
                </Form.Group>
                <Form.Group controlId="interneeEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formData.interneeEmail} onChange={(e) => handleChange("interneeEmail", e.target.value)} isInvalid={!!errors.interneeEmail}  placeholder="Enter student email"/>
                  <Form.Text className="text-danger">{errors.interneeEmail}</Form.Text>
                </Form.Group>
              </div>
            </Col>
            <Col style={{ minWidth: "300px" }}>
              <div className="border-box">
                <h5 style={{ backgroundColor: '#9d2235', color: 'white', padding: '8px', borderRadius: '5px' }}>Workplace Details</h5>
                <Form.Group controlId="companyName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} isInvalid={!!errors.companyName} placeholder="Enter company name"/>
                  <Form.Text className="text-danger">{errors.companyName}</Form.Text>
                </Form.Group>
                <Form.Group controlId="companyWebsite">
                  <Form.Label>Website</Form.Label>
                  <Form.Control type="text" value={formData.companyWebsite} onChange={(e) => handleChange("companyWebsite", e.target.value)} isInvalid={!!errors.companyWebsite} placeholder="Enter company website" />
                  <Form.Text className="text-danger">{errors.companyWebsite}</Form.Text>
                </Form.Group>
                <Form.Group controlId="companyPhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" maxLength={10} value={formData.companyPhone} onChange={(e) => handleChange("companyPhone", e.target.value)} isInvalid={!!errors.companyPhone} placeholder="Enter 10-digit phone number" />
                  <Form.Text className="text-danger">{errors.companyPhone}</Form.Text>
                </Form.Group>
              </div>
            </Col>
            <Col style={{ minWidth: "300px" }}>
              <div className="border-box">
                <h5 style={{ backgroundColor: '#9d2235', color: 'white', padding: '8px', borderRadius: '5px' }}>Internship Advisor Details</h5>
                <Form.Group controlId="advisorName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={formData.advisorName} onChange={(e) => handleChange("advisorName", e.target.value)} isInvalid={!!errors.advisorName}  placeholder="Enter advisor's name"/>
                  <Form.Text className="text-danger">{errors.advisorName}</Form.Text>
                </Form.Group>
                <Form.Group controlId="advisorTitle">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control type="text" value={formData.advisorTitle} onChange={(e) => handleChange("advisorTitle", e.target.value)} isInvalid={!!errors.advisorTitle} placeholder="Enter advisor's job title" />
                  <Form.Text className="text-danger">{errors.advisorTitle}</Form.Text>
                </Form.Group>
                <Form.Group controlId="advisorEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formData.advisorEmail} onChange={(e) => handleChange("advisorEmail", e.target.value)} isInvalid={!!errors.advisorEmail} placeholder="Enter advisor's email"/>
                  <Form.Text className="text-danger">{errors.advisorEmail}</Form.Text>
                </Form.Group>
              </div>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={6}>
              <Form.Group controlId="presentationDate">
                <Form.Label>Presentation Date</Form.Label>
                <Form.Control type="date" value={formData.presentationDate} onChange={(e) => handleChange("presentationDate", e.target.value)} isInvalid={!!errors.presentationDate} />
                <Form.Text className="text-danger">{errors.presentationDate}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table bordered responsive className="custom-table mt-4">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Satisfactory</th>
                    <th>Unsatisfactory</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {["Presentation Content", "Delivery and Communication", "Answering Questions"].map((item) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>
                        <Form.Check type="radio" name={`${item}-rating`} value="Satisfactory" checked={formData[`${item}_rating`] === "Satisfactory"} onChange={(e) => handleChange(`${item}_rating`, e.target.value)} required />
                      </td>
                      <td>
                        <Form.Check type="radio" name={`${item}-rating`} value="Unsatisfactory" checked={formData[`${item}_rating`] === "Unsatisfactory"} onChange={(e) => handleChange(`${item}_rating`, e.target.value)}  />
                      </td>
                      <td>
                        <Form.Control type="text" placeholder="Enter comments" value={formData[`${item}_comments`] || ""} onChange={(e) => handleChange(`${item}_comments`, e.target.value)}  />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Form.Label>Internship Coordinator Signature</Form.Label>
              <div
                style={{ cursor: "pointer", borderBottom: "1px solid #ccc", minHeight: "40px", padding: "6px 0" }}
                onClick={() => setShowModal(true) }
              >
                {renderSignaturePreview()}
              </div>
              <Form.Text className="text-danger">{errors.coordinatorSignature}</Form.Text>
            </Col>
          </Row>

          <div className="text-center">
            <Button variant="primary" type="submit" className="mt-4 px-5" style={{ backgroundColor: "#9d2235", borderColor: "#9d2235" }}>Submit</Button>
          </div>
        </Form>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="rounded shadow bg-white p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Sign Here</h5>
            <Button variant="light" size="sm" onClick={() => setShowModal(false)}>✕</Button>
          </div>
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item><Nav.Link eventKey="type">Type in</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="draw">Draw by hand</Nav.Link></Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="type">
                <Form.Control placeholder="Your name" value={typedSignature} onChange={(e) => setTypedSignature(e.target.value)} className="mb-3" />
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {fonts.map((font) => (
                    <div key={font} onClick={() => setSelectedFont(font)} style={{ cursor: "pointer", fontFamily: font, padding: "10px 15px", border: font === selectedFont ? "2px solid #9d2235" : "1px solid #ccc", borderRadius: "10px", fontSize: "24px", backgroundColor: "#fff" }}>
                      {typedSignature || "Your name"}
                    </div>
                  ))}
                </div>
                <div className="text-end mt-3">
                  <Button size="sm" style={{ backgroundColor: "#9d2235", borderColor: "#9d2235" }} onClick={handleSignatureInsert}>✓</Button>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="draw">
                <div className="signature-canvas-container position-relative rounded border shadow-sm p-3 bg-light">
                  <div className="position-absolute start-0 top-0 bg-warning px-3 py-1 rounded-end">Draw here</div>
                  <SignatureCanvas ref={sigCanvasRef} penColor="black" canvasProps={{ width: 500, height: 150, className: "sigCanvas w-100 rounded border" }} />
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <Button variant="outline-secondary" size="sm" onClick={() => sigCanvasRef.current?.clear()}>Clear</Button>
                    <Button size="sm" style={{ backgroundColor: "#9d2235", borderColor: "#9d2235" }} onClick={handleSignatureInsert}>✓</Button>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default A4PresentationEvaluationForm;

