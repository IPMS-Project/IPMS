import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CoordinatorRequestDetailView.css"; // Reuse same styling

const CoordinatorManualReviewView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchManualReviewForm = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/coordinator/manual-review-a1`);
        const matchedForm = res.data.find((form) => form._id === id);
        setFormData(matchedForm || null);
      } catch (err) {
        console.error("Error fetching manual review form:", err);
      }
    };
    fetchManualReviewForm();
  }, [id]);

  const handleApprove = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/coordinator/manual-review-a1/${id}/approve`);
      alert(res.data.message);
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving manual review form.");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) {
      alert("Rejection reason is required!");
      return;
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/coordinator/manual-review-a1/${id}/reject`, { reason });
      alert(res.data.message);
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting manual review form.");
    }
  };

  if (!formData) return <h2>Loading form details...</h2>;

  return (
    <div className="request-form">
      <h2 className="dashboard-title">Manual Review (Failed A1 Form)</h2>

      <div className="dashboard-card">
        <p><b>Student:</b> {formData.student?.userName || "N/A"}</p>
        <p><b>Email:</b> {formData.student?.email || "N/A"}</p>
        <p><b>Company:</b> {formData.workplace?.name || "N/A"}</p>

        <h3 className="section-title">Tasks & CS Outcomes</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Outcomes</th>
            </tr>
          </thead>
          <tbody>
            {formData.tasks.map((task, idx) => (
              <tr key={idx}>
                <td>{task.description}</td>
                <td>{task.outcomes?.join(", ") || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="action-buttons" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button className="approve-btn" onClick={handleApprove}>Approve</button>
          <button className="reject-btn" onClick={handleReject}>Reject</button>
          <button className="back-btn" onClick={() => navigate("/coordinator-dashboard")}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorManualReviewView;
