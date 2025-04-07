import React, { useEffect, useState } from "react";
import axios from "axios";

const SupervisorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/submissions/pending");
      setSubmissions(response.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleDecision = async (id, action) => {
    try {
      const endpoint = `http://localhost:5000/api/submissions/${id}/${action}`;
      await axios.post(endpoint);
      alert(`Submission ${action}d successfully!`);
      fetchPendingSubmissions(); // refresh list
    } catch (err) {
      console.error("Error updating submission:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Supervisor Dashboard</h2>
      <p>Welcome, Supervisor!</p>

      <h3>Pending Submissions</h3>
      {submissions.length === 0 ? (
        <p>No pending submissions.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Submitted By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission._id}>
                <td>{submission._id}</td>
                <td>{submission.title || "N/A"}</td>
                <td>{submission.studentName || "N/A"}</td>
                <td>
                  <button onClick={() => handleDecision(submission._id, "approve")}>Approve</button>{" "}
                  <button onClick={() => handleDecision(submission._id, "reject")}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupervisorDashboard;