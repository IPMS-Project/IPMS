import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CoordinatorRequestDetailView.css";

const CoordinatorEvaluationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    fetchEvaluationDetails();
  }, [id]);

  const fetchEvaluationDetails = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/coordinator/evaluations`
      );
      const matchedEvaluation = res.data.find((form) => form._id === id);
      setEvaluation(matchedEvaluation || null);
    } catch (err) {
      console.error("Error fetching evaluation form:", err);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/coordinator/evaluation/${id}/approve`
      );
      alert(res.data.message);
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Error approving evaluation:", err);
      alert("Error approving evaluation form.");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) {
      alert("Rejection reason is required!");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/coordinator/evaluation/${id}/reject`,
        { reason }
      );
      alert(res.data.message);
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Error rejecting evaluation:", err);
      alert("Error rejecting evaluation form.");
    }
  };

  if (!evaluation) return <h2>Loading evaluation details...</h2>;

  return (
    <div className="request-form">
      <h2 className="dashboard-title">Job Evaluation (Form A3) Review</h2>

      <div className="dashboard-card">
        <p>
          <b>Internee Name:</b> {evaluation.interneeName}
        </p>
        <p>
          <b>Internee Email:</b> {evaluation.interneeEmail}
        </p>

        <h3 className="section-title">Evaluation Categories</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Rating</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {evaluation.evaluations.map((item, idx) => (
              <tr key={idx}>
                <td>{item.category}</td>
                <td>{item.rating}</td>
                <td>{item.comment || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="action-buttons"
          style={{ marginTop: "20px", display: "flex", gap: "10px" }}
        >
          <button className="approve-btn" onClick={handleApprove}>
            Approve
          </button>
          <button className="reject-btn" onClick={handleReject}>
            Reject
          </button>
          <button
            className="back-btn"
            onClick={() => navigate("/coordinator-dashboard")}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorEvaluationReview;
