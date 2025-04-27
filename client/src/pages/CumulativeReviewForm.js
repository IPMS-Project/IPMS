import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/CumulativeReviewForm.css";

const CumulativeReviewForm = () => {
  const { groupIndex } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  const email = "vikash.balaji.kokku-1@ou.edu"; // 🔥 Set your email dynamically if you have login later

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cumulative/group`, {
          params: { email, groupIndex }
        });
        setGroupData(res.data.group);
      } catch (err) {
        console.error("Failed to fetch group:", err);
        Swal.fire({ icon: "error", title: "Failed to load report group." });
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupIndex]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      return Swal.fire({ icon: "warning", title: "Comment cannot be empty!" });
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/supervisor-comments`, {
        email,
        groupIndex: groupData.groupIndex,
        comments: comment,
        weeks: groupData.weeks,
      });

      Swal.fire({ icon: "success", title: "Comment Submitted Successfully!", timer: 1500, showConfirmButton: false });
      navigate("/supervisor-dashboard");
    } catch (err) {
      console.error("Error submitting comment:", err);
      Swal.fire({ icon: "error", title: "Failed to submit comment." });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!groupData) return <p>No data found.</p>;

  return (
    <div className="cumulative-review-container">
      <h2>Review Cumulative Weekly Reports</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Hours</th>
            <th>Tasks</th>
            <th>Lessons</th>
          </tr>
        </thead>
        <tbody>
          {groupData.reports.map((report, index) => (
            <tr key={index}>
              <td>{report.week}</td>
              <td>{report.hours}</td>
              <td>{report.tasks}</td>
              <td>{report.lessons}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <textarea
        placeholder="Add supervisor comments here..."
        rows={5}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="actions">
        <button className="cancel-btn" onClick={() => navigate("/supervisor-dashboard")}>
          Cancel
        </button>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Comment
        </button>
      </div>
    </div>
  );
};

export default CumulativeReviewForm;
