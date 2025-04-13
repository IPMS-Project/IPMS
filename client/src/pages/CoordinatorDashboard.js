import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CoordinatorIcon from "../Icons/CoordinatorIcon";
import { FaExclamationCircle } from 'react-icons/fa';
import '../styles/dashboard.css';

const CoordinatorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const url = process.env.REACT_APP_API_URL;

  const fetchPendingSubmissions = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/coordinator/requests`);
      setSubmissions(response.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  }, [url]);

  useEffect(() => {
    fetchPendingSubmissions();
  }, [fetchPendingSubmissions]);

  const handleApprove = async (id) => {
    const comment = prompt("Add coordinator comment before approving:");
    if (!comment) return alert("Comment is required for approval.");

    try {
      const res = await axios.post(`${url}/api/coordinator/requests/${id}/approve`, { comment });
      alert(res.data.message);
      fetchPendingSubmissions(); // refresh after action
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving request.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please provide a comment for rejection:");
    if (!reason) return alert("Rejection comment is required.");

    try {
      const res = await axios.post(`${url}/api/coordinator/requests/${id}/reject`, { reason });
      alert(res.data.message);
      fetchPendingSubmissions();
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting request.");
    }
  };

  const CurrentDate = new Date();

  const SubmissionComponent = ({ submission }) => {
    const diffTime = CurrentDate - new Date(submission.requestedAt);
    const diffDays = diffTime / (1000 * 3600 * 24);
    const containerStyle = diffDays > 5 ? { backgroundColor: '#fafab6' } : {};

    return (
      <div style={containerStyle} className="dashboard-container form-list">
        <h3>
          {diffDays > 5 && (
            <span style={{ marginRight: '8px', color: '#9d2235' }}>
              <FaExclamationCircle size={40} />
            </span>
          )}
          {submission.fullName}
        </h3>
        <p><b>Company:</b> {submission.company || "N/A"}</p>
        <p><b>Email:</b> {submission.ouEmail}</p>
        <p><b>Date Submitted:</b> {new Date(submission.requestedAt).toLocaleDateString()}</p>
        <div style={{ marginTop: "10px" }}>
          <button className="approve-btn" onClick={() => handleApprove(submission._id)}>Approve</button>
          <button className="reject-btn" onClick={() => handleReject(submission._id)} style={{ marginLeft: "10px" }}>Reject</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div>
        <div className="header-icon">
          <CoordinatorIcon />
        </div>
        <h1 className="dashboard-title">Coordinator Dashboard</h1>
      </div>
      <div className="dashboard-container">
        <h2>Pending Internship Approvals</h2>
        {submissions.length === 0 ? (
          <div className="dashboard-container form-list">
            <h3 className="default-text">No pending approvals at this time.</h3>
          </div>
        ) : (
          submissions.map((item) => <SubmissionComponent key={item._id} submission={item} />)
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
