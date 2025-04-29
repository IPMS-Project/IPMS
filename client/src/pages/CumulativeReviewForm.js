import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CumulativeReviewForm.css";

const CumulativeReviewForm = () => {
  const { groupIndex } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  //const email = "rohan.mukka-1@ou.edu"; // TODO: Replace dynamically later
  const ipmsUser = localStorage.getItem("ipmsUser");
  const email = ipmsUser ? JSON.parse(ipmsUser).email : null;
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cumulative/group/${groupIndex}`, {
          params: { email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroupData(res.data.group);
      } catch (error) {
        console.error("Failed to fetch group:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupIndex, token, email]);

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please add a comment before submitting.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/supervisor-comments`, {
        email,
        groupIndex: parseInt(groupIndex),
        comments: comment,
        weeks: groupData.weeks,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Review submitted successfully!");
      window.location.href = "/supervisor-dashboard";
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review.");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!groupData) return <p>No group data found.</p>;

  return (
    <div className="cumulative-review-container">
      <h2>Supervisor Group Review</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Hours</th>
            <th>Tasks</th>
            <th>Lessons Learned</th>
          </tr>
        </thead>
        <tbody>
          {groupData.reports.map((report) => (
            <tr key={report._id}>
              <td>{report.week}</td>
              <td>{report.hours}</td>
              <td>{report.tasks}</td>
              <td>{report.lessons}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <textarea
        className="comment-box"
        placeholder="Supervisor's comments..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="button-group">
        <button className="cancel-button" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button className="submit-button" onClick={submitReview}>
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default CumulativeReviewForm;
