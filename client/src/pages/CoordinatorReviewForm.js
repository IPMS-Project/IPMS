import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CumulativeReviewForm.css";

const CoordinatorReviewForm = () => {
  const { groupIndex } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reports/group/${groupIndex}`
        );
        if (res.data.success) {
          setReports(res.data.group.reports);
        }
      } catch (err) {
        console.error("Failed to load group reports", err);
      }
    };

    fetchGroup();
  }, [groupIndex]);

  const handleSubmit = async () => {
    try {
      const promises = reports.map((r) =>
        axios.put(
          `${process.env.REACT_APP_API_URL}/api/reports/${r._id}/coordinator-comment`,
          { coordinatorComments: comment }
        )
      );
      await Promise.all(promises);
      setMessage("Coordinator comment submitted successfully!");
      setTimeout(() => navigate("/coordinator-dashboard"), 1500);
    } catch (err) {
      console.error("Failed to submit coordinator comments", err);
      setMessage("Failed to submit comment.");
    }
  };

  return (
    <div className="cumulative-review-container">
      <h2>Coordinator Review - Group {parseInt(groupIndex) + 1}</h2>

      {reports.map((r, idx) => (
        <div key={r._id} className="review-report-card">
          <h4>Week {r.week}</h4>
          <p><strong>Hours:</strong> {r.hours}</p>
          <p><strong>Tasks:</strong> {r.tasks}</p>
          <p><strong>Lessons:</strong> {r.lessons}</p>
          <p><strong>Supervisor Comments:</strong> {r.supervisorComments}</p>
        </div>
      ))}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your coordinator comments..."
      ></textarea>

      <button onClick={handleSubmit} className="submit-button">
        Submit Coordinator Comment
      </button>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default CoordinatorReviewForm;
