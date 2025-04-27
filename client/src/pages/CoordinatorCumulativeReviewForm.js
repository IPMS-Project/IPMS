import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/CoordinatorCumulativeReviewForm.css";

const CoordinatorCumulativeReviewForm = () => {
  const { groupIndex } = useParams();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [coordinatorComment, setCoordinatorComment] = useState("");
  const [supervisorComment, setSupervisorComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch the report group when component mounts
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reports/cumulative/group/${groupIndex}`
        );
        if (res.data.success) {
          const fetchedReports = res.data.group.reports || [];
          setReports(fetchedReports);
          setSupervisorComment(fetchedReports[0]?.supervisorComments || "Not available");
        }
      } catch (err) {
        console.error("Failed to fetch group:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupIndex]);

  // Submit coordinator comments for all reports in the group
  const handleSubmit = async () => {
    if (!coordinatorComment.trim()) {
      Swal.fire("Error", "Comment cannot be empty.", "error");
      return;
    }
  
    try {
      const weeks = reports.map((report) => report.week); // extract weeks
  
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/coordinator-comments`, {
        groupIndex: parseInt(groupIndex),
        coordinator_status: "approved",
        comments: coordinatorComment.trim(),
        weeks,
      });
  
      Swal.fire("Success", "Coordinator comment submitted.", "success");
  
      localStorage.setItem("reviewedGroupIndex", groupIndex); // ✅ For dashboard refresh
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Failed to submit coordinator comment", err);
      Swal.fire("Error", "Failed to submit comment. Please try again.", "error");
    }
  };

  // Submit coordinator coordinator rejction
  const handleReject = async () => {  
    try {
      const weeks = reports.map((report) => report.week); // extract weeks
  
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/coordinator-comments`, {
        groupIndex: parseInt(groupIndex),
        coordinator_status: "rejected",
        comments: "",
        weeks,
      });
  
      Swal.fire("Success", "Coordinator rejected weekly update FORM A2.", "success");
  
      localStorage.setItem("reviewedGroupIndex", groupIndex); // ✅ For dashboard refresh
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("[CoordinatorCumulativeReviewForm] Failed to reject weekly report", err);
      Swal.fire("Error", "Failed to reject weekly report. Please try again.", "error");
    }
  };  

  if (loading) {
    return <p className="coordinator-review-container">Loading...</p>;
  }

  return (
    <div className="coordinator-review-container">
      <h2>Review Cumulative Weekly Reports</h2>

      <table className="coordinator-review-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Hours</th>
            <th>Tasks</th>
            <th>Lessons</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, idx) => (
            <tr key={idx}>
              <td>{report.week}</td>
              <td>{report.hours}</td>
              <td>{report.tasks}</td>
              <td>{report.lessons}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="comment-section">
        <label><strong>Supervisor Comment</strong></label>
        <div className="readonly-display">{supervisorComment}</div>
      </div>

      <div className="comment-section">
        <label htmlFor="coordinatorComments"><strong>Coordinator Comment</strong></label>
        <textarea
          id="coordinatorComments"
          className="coordinator-comment-box"
          placeholder="Add coordinator comments here..."
          value={coordinatorComment}
          onChange={(e) => setCoordinatorComment(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button className="reject-btn" onClick={handleReject}>
          Reject
        </button>
        <button className="cancel-btn" onClick={() => navigate("/coordinator-dashboard")}>
          Cancel
        </button>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Comment
        </button>
      </div>
    </div>
  );
};

export default CoordinatorCumulativeReviewForm;
