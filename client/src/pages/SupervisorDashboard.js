import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";

const SupervisorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const url = process.env.REACT_APP_API_URL;

  const fetchPendingSubmissions = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/submissions/pending");
      setSubmissions(response.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  }, [url]);

  console.log("Submissions:", submissions); //! Debugging line

  useEffect(() => {
    fetchPendingSubmissions();
  }, [fetchPendingSubmissions]);

  const handleDecision = async (id, action) => {
    try {
      const endpoint = url + `/api/submissions/${id}/${action}`;
      await axios.post(endpoint);
      alert(`Submission ${action}d successfully!`);
      fetchPendingSubmissions(); // refresh list
    } catch (err) {
      console.error("Error updating submission:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Supervisor Dashboard</h1>
      <h2>Pending Approvals</h2>

      <ul className="pending-approvals">
        {submissions.length === 0 ? (
          <div className="empty-message-container">
            <div className="empty-message">
              No pending approvals at this time.
            </div>
          </div>
        ) : (
          submissions.map((item) => (
            <li key={item._id}>
              <div className="submission-header">{item.name}</div>

              <div style={{ marginTop: "10px" }}>
                {Array.isArray(item.details) ? (
                  item.details.map((entry, index) => (
                    <div key={index} className="week-entry">
                      <strong>{entry.week}</strong> – Tasks: {entry.tasks} |
                      Hours: {entry.hours} hrs
                      <br />
                      Lessons: {entry.lessons}
                      {entry.supervisorComments && (
                        <>
                          <br />
                          Supervisor Comment: {entry.supervisorComments}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="week-entry">{item.details}</div>
                )}
              </div>

              <div>
                Status : {""}
                <span>
                  {item.supervisor_status === "pending"
                    ? "Pending"
                    : "Reviewed"}
                </span>
              </div>

              <div className="button-group">
                <button
                  className="approve"
                  onClick={() => handleDecision(item._id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="reject"
                  onClick={() => handleDecision(item._id, "reject")}
                >
                  Reject
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SupervisorDashboard;
