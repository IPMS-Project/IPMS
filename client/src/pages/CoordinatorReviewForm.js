import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CoordinatorCumulativeReviewForm.css";

const CoordinatorReviewForm = () => {
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [coordinatorComment, setCoordinatorComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Get review details saved in localStorage
  const email = localStorage.getItem("reviewEmail");
  const weeks = JSON.parse(localStorage.getItem("reviewWeeks"));

  useEffect(() => {
    if (email && weeks) {
      fetchGroup();
    } else {
      console.error("Review email or weeks not found in localStorage");
      setLoading(false);
    }
  }, []);

  const fetchGroup = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports/fetch-group`,
        { email, weeks }
      );
      console.log("Fetched Group:", response.data);
      setGroup(response.data.group);
    } catch (error) {
      console.error("Failed to load group reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/coordinator-comments`, {
        email,
        comments: coordinatorComment,
        weeks,
      });
      alert("Coordinator comment submitted successfully!");
      navigate("/coordinator-dashboard");
    } catch (error) {
      console.error("Error submitting coordinator comments", error.response?.data || error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) return <div>Loading cumulative review...</div>;
  if (!group) return <div>No group data found.</div>;

  const studentName = group.reports[0]?.name || "Student";
  const supervisorComment = group.reports[0]?.supervisorComments || "No comment provided.";
  const supervisorName = group.reports[0]?.supervisorName || "Supervisor";

  return (
    <div className="cumulative-review-container">
      <h2 className="cumulative-review-header">
        Cumulative Weekly Report of {studentName} for Weeks {group.weeks.map(w => w.split(" ")[1]).join(", ")}
      </h2>

      <table className="review-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Hours</th>
            <th>Tasks</th>
            <th>Lessons</th>
          </tr>
        </thead>
        <tbody>
          {group.reports.map((report, idx) => (
            <tr key={idx}>
              <td>{report.week}</td>
              <td>{report.hours}</td>
              <td>{report.tasks}</td>
              <td>{report.lessons}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="supervisor-comment-box">
        <strong>Supervisor ({supervisorName}) Comment:</strong>
        <p>{supervisorComment}</p>
      </div>

      <textarea
        className="coordinator-comment-area"
        value={coordinatorComment}
        onChange={(e) => setCoordinatorComment(e.target.value)}
        placeholder="Write your coordinator review comment here..."
      />

      <div className="button-container">
        <button className="cancel-button" onClick={() => navigate("/coordinator-dashboard")}>
          Cancel
        </button>
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default CoordinatorReviewForm;
