// client/src/pages/A3JobEvaluationForm.jsx
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

// Fonts for typed signatures
const fonts = ["Pacifico","Indie Flower","Dancing Script","Great Vibes","Satisfy"];

// Evaluation criteria
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

export default function A3JobEvaluationForm() {
  // hard‑code your backend URL:
  const BASE = "http://localhost:5001";

  // ── form state ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    interneeEmail: "",
    interneeName: "",
    interneeID: "",
    advisorSignature: "",
    advisorAgreement: false,
    coordinatorSignature: "",
    coordinatorAgreement: false,
  });
  const [fetchError, setFetchError] = useState("");
  const [errors, setErrors]         = useState({});
  const [ratings, setRatings]       = useState({});
  const [comments, setComments]     = useState({});

  // signature modal state
  const [showModal, setShowModal]                   = useState(false);
  const [activeSignatureTarget, setActiveSignatureTarget] = useState("advisor");
  const [typedSignatures, setTypedSignatures]       = useState({ advisor: "", coordinator: "" });
  const [selectedFont, setSelectedFont]             = useState(fonts[0]);
  const [activeTab, setActiveTab]                   = useState("type");
  const sigCanvasRef = useRef(null);

  useEffect(() => {
    if (activeTab === "type") {
      setTypedSignatures(ts => ({ ...ts, [activeSignatureTarget]: "" }));
    }
  }, [activeTab, showModal, activeSignatureTarget]);

  // ── generic change handler ─────────────────────────────────
  const handleChange = (field, value) => {
    setFormData(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    if (field === "interneeEmail") setFetchError("");
  };

  // ── fetch A.1 by email onBlur ───────────────────────────────
  const handleEmailBlur = async () => {
    const email = formData.interneeEmail.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(email)) return;
    try {
      const res = await fetch(`${BASE}/api/form/email/${encodeURIComponent(email)}`);
      if (!res.ok) {
        setFetchError("No A.1 form found for that email");
        return;
      }
      const form = await res.json();
      setFormData(f => ({
        ...f,
        interneeName: form.student.name,
        interneeID:   form.student.soonerId,
      }));
    } catch {
      setFetchError("Lookup failed");
    }
  };

  // ── form validation ─────────────────────────────────────────
  const validateForm = () => {
    const newErr = {};
    if (!/\S+@\S+\.\S+/.test(formData.interneeEmail)) newErr.interneeEmail = "Valid email required";
    if (!formData.interneeName.trim())                 newErr.interneeName  = "Name is required";
    if (!/^\d{9}$/.test(formData.interneeID))           newErr.interneeID    = "9‑digit ID required";
    evaluationItems.forEach(item => {
      if (!ratings[item]) newErr[`${item}_rating`] = "Select one";
    });
    if (!formData.advisorSignature)     newErr.advisorSignature     = "Signature required";
    if (!formData.coordinatorSignature) newErr.coordinatorSignature = "Signature required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleRatingChange  = (item, val) => setRatings(r => ({ ...r, [item]: val }));
  const handleCommentChange = (item, val) => setComments(c => ({ ...c, [item]: val }));

  // ── insert signature ────────────────────────────────────────
  const handleSignatureInsert = () => {
    const fld = activeSignatureTarget === "advisor" ? "advisorSignature" : "coordinatorSignature";

    if (activeTab === "type" && typedSignatures[activeSignatureTarget].trim()) {
      setFormData(f => ({
        ...f,
        [fld]: {
          type:  "text",
          value: typedSignatures[activeSignatureTarget],
          font:  selectedFont
        }
      }));
    } else {
      const canvas = sigCanvasRef.current;
      if (!canvas || canvas.isEmpty()) { alert("Draw your signature."); return; }
      const url = canvas.getCanvas?.().toDataURL() || canvas.getCanvas().toDataURL();
      setFormData(f => ({ ...f, [fld]: { type: "draw", value: url } }));
    }
    setShowModal(false);
  };

  // ── preview signature ───────────────────────────────────────
  const renderSignaturePreview = field => {
    const sig = formData[field];
    if (!sig) return <span style={{ color: "gray" }}>Click to sign</span>;
    if (sig.type === "draw") {
      return <img src={sig.value} alt="sig" style={{ maxHeight: 40 }} />;
    }
    return <span style={{ fontFamily: sig.font, fontSize: 24 }}>{sig.value}</span>;
  };

  // ── submit evaluation ───────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm() || !formData.advisorAgreement || !formData.coordinatorAgreement) {
      alert("Complete all fields & agreements");
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/evaluation`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          interneeName:       formData.interneeName,
          interneeID:         formData.interneeID,
          interneeEmail:      formData.interneeEmail,
          advisorSignature:   formData.advisorSignature,
          advisorAgreement:   formData.advisorAgreement,
          coordinatorSignature: formData.coordinatorSignature,
          coordinatorAgreement: formData.coordinatorAgreement,
          ratings,
          comments,
        }),
      });
      if (res.ok) {
        alert("Submitted!");
        // reset
        setFormData({
          interneeEmail: "",
          interneeName: "",
          interneeID: "",
          advisorSignature: "",
          advisorAgreement: false,
          coordinatorSignature: "",
          coordinatorAgreement: false,
        });
        setRatings({});
        setComments({});
        sigCanvasRef.current?.clear();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Unknown"}`);
      }
    } catch {
      alert("Server error.");
    }
  };

  return (
    <div className="page-content">
      <h2 className="heading-maroon">A.3 – Job Performance Evaluation</h2>
      <Container className="p-4 rounded shadow-lg" style={{ maxWidth: 900, backgroundColor: "#fff" }}>
        <Form onSubmit={handleSubmit}>

          {/* ─── Internee Details ───────────────────────────── */}
          <Row className="mb-4">
            <Col xs={12}>
              <h5>Internee Details</h5>

              <Form.Group controlId="interneeEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter student email"
                  value={formData.interneeEmail}
                  onChange={e => handleChange("interneeEmail", e.target.value)}
                  onBlur={handleEmailBlur}
                  isInvalid={!!errors.interneeEmail || !!fetchError}
                  style={{ maxWidth: 300 }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.interneeEmail || fetchError}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="interneeName" className="mt-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Student name"
                  value={formData.interneeName}
                  onChange={e => handleChange("interneeName", e.target.value)}
                  isInvalid={!!errors.interneeName}
                  style={{ maxWidth: 300 }}
                />
                <Form.Control.Feedback type="invalid">{errors.interneeName}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="interneeID" className="mt-3">
                <Form.Label>Sooner ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="9‑digit Sooner ID"
                  maxLength={9}
                  value={formData.interneeID}
                  onChange={e => handleChange("interneeID", e.target.value)}
                  isInvalid={!!errors.interneeID}
                  style={{ maxWidth: 300 }}
                />
                <Form.Control.Feedback type="invalid">{errors.interneeID}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* ─── Ratings Table ─────────────────────────────── */}
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
              {evaluationItems.map((item,i) => (
                <tr key={i}>
                  <td>{item}</td>
                  <td colSpan={2}>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        id={`sat-${i}`}
                        name={`item-${i}`}
                        label="Satisfactory"
                        checked={ratings[item]==="Satisfactory"}
                        onChange={()=>handleRatingChange(item,"Satisfactory")}
                        isInvalid={!!errors[`${item}_rating`]}
                      />
                      <Form.Check
                        type="radio"
                        id={`unsat-${i}`}
                        name={`item-${i}`}
                        label="Unsatisfactory"
                        checked={ratings[item]==="Unsatisfactory"}
                        onChange={()=>handleRatingChange(item,"Unsatisfactory")}
                        isInvalid={!!errors[`${item}_rating`]}
                      />
                    </div>
                    {errors[`${item}_rating`] && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors[`${item}_rating`]}
                      </Form.Control.Feedback>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter comments"
                      value={comments[item]||""}
                      onChange={e=>handleCommentChange(item,e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* ─── Signatures ───────────────────────────────── */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Advisor Signature</Form.Label>
                <div
                  className="signature-preview"
                  onClick={() => { setActiveSignatureTarget("advisor"); setShowModal(true); }}
                >
                  {renderSignaturePreview("advisorSignature")}
                </div>
                {errors.advisorSignature && <div className="text-danger">{errors.advisorSignature}</div>}
                <Form.Check
                  type="checkbox"
                  label="I agree this is my signature."
                  checked={formData.advisorAgreement}
                  onChange={e=>handleChange("advisorAgreement", e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Coordinator Signature</Form.Label>
                <div
                  className="signature-preview"
                  onClick={() => { setActiveSignatureTarget("coordinator"); setShowModal(true); }}
                >
                  {renderSignaturePreview("coordinatorSignature")}
                </div>
                {errors.coordinatorSignature && <div className="text-danger">{errors.coordinatorSignature}</div>}
                <Form.Check
                  type="checkbox"
                  label="I agree this is my signature."
                  checked={formData.coordinatorAgreement}
                  onChange={e=>handleChange("coordinatorAgreement", e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center">
            <Button type="submit" className="px-5 text-white" style={{ backgroundColor: "#9d2235", borderColor: "#9d2235" }}>
              Submit Evaluation
            </Button>
          </div>
        </Form>
      </Container>

      {/* ─── Signature Modal ─────────────────────────────── */}
      <Modal show={showModal} onHide={()=>setShowModal(false)} centered dialogClassName="custom-signature-modal">
        <Modal.Body className="rounded shadow bg-white p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Sign Here</h5>
            <Button variant="light" size="sm" onClick={()=>setShowModal(false)}>✕</Button>
          </div>
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item><Nav.Link eventKey="type">Type</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="draw">Draw</Nav.Link></Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="type">
                <Form.Control
                  type="text"
                  placeholder="Your name"
                  value={typedSignatures[activeSignatureTarget]}
                  onChange={e => setTypedSignatures(ts => ({ ...ts, [activeSignatureTarget]: e.target.value }))}
                  className="mb-3"
                />
                <div className="d-flex flex-wrap gap-2">
                  {fonts.map(f => (
                    <span
                      key={f}
                      onClick={()=>setSelectedFont(f)}
                      style={{
                        cursor:"pointer", fontFamily: f,
                        padding:"5px 10px",
                        border: f===selectedFont ? "2px solid #9d2235":"1px solid #ccc",
                        borderRadius:4
                      }}
                    >
                      {typedSignatures[activeSignatureTarget]||"Sample"}
                    </span>
                  ))}
                </div>
                <div className="text-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleSignatureInsert}
                    style={{ backgroundColor:"#9d2235", borderColor:"#9d2235" }}
                  >
                    ✓
                  </Button>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="draw">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="black"
                  canvasProps={{ width:500, height:150, className:"sigCanvas w-100" }}
                />
                <div className="mt-2 d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={()=>sigCanvasRef.current.clear()}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSignatureInsert}
                    style={{ backgroundColor:"#9d2235", borderColor:"#9d2235" }}
                  >
                    ✓
                  </Button>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </Modal>
    </div>
  );
}
