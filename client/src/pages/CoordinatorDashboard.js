import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CoordinatorIcon from "../Icons/CoordinatorIcon";
import { FaExclamationCircle } from 'react-icons/fa'; // Exclamation mark (!) icon from Font Awesome
import '../styles/Dashboard.css';

const CoordinatorDashboard = () => {
  const initialState = {
    formId : '0',
    studentName : 'First Last',
    dateSubmittted: '01-01-2025',
    company: 'Test Company'
  }
  const [submissions, setSubmissions] = useState([initialState]);
  const url = process.env.REACT_APP_API_URL

  const fetchPendingSubmissions = useCallback(async () => {
      try {
          const response = await axios.get(url + "/api/submissions/pending");
          setSubmissions(response.data);
      } catch (err) {
          console.error("Error fetching submissions:", err);
      }
  }, [url]);

  useEffect(() => {
      fetchPendingSubmissions();
  }, [fetchPendingSubmissions]);

  const CurrentDate = new Date()

  const SubmissionComponent = ({submission}) => {
    const diffTime = CurrentDate - (new Date(submission.dateSubmittted))
    const diffDays = diffTime / (1000 * 3600 * 24); // milliseconds to days
    const containerStyle = diffDays > 5 ? {backgroundColor: '#fafab6'} : {};
    return (
      <div style={containerStyle} className="dashboard-container form-list">
        <h3>
          { diffDays > 5 && (
            <span style={{marginRight: '8px', color: '#9d2235'}}>
              <FaExclamationCircle size={40}/>
            </span>
          )}
          {submission.studentName}
        </h3>
        <span>Company: {submission.company}</span>
        <span>Date Submitteed: {submission.dateSubmittted}</span>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div className="header-icon">
          <CoordinatorIcon/>
        </div>
        <h1 className="dashboard-title">Coordinator Dashboard</h1>
      </div>
      <div className="dashboard-container">
        <h2>Pending Approvals</h2>
        {submissions.length === 0 ? (
          <div className="dashboard-container form-list">
            <h3 className="default-text">No pending approvals at this time.</h3>
          </div>
        ) : (
          submissions.map(item => (
            <SubmissionComponent submission={item}/>
          ))
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;