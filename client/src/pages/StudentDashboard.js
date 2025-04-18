import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StudentDashboard.css"; // optional for styling

const StudentDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/submissions`);
        setSubmissions(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setMessage("Error loading data.");
      }
    };

    fetchSubmissions();
  }, []);

  const handleResend = async (id) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/coordinator/request/${id}/resend`);
      alert("Resent to coordinator!");
    } catch (err) {
      console.error("Resend error:", err);
      alert("Could not resend. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/student/request/${id}/delete`);
      alert("Deleted successfully.");
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete. Try again.");
    }
  };

  return (
    <div className="student-dashboard">
      <h2>My Internship Submissions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <table className="submission-table">
          <thead>
            <tr>
              <th>Form</th>
              <th>Status</th>
              <th>Coordinator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id}>
                <td>{s.form_type}</td>
                <td>{s.supervisor_status === "approved" && s.coordinator_status === "pending" ? "Waiting for Coordinator" : "In Progress"}</td>
                <td>{s.coordinator_status}</td>
                <td>
                  {s.supervisor_status === "approved" && s.coordinator_status === "pending" && (
                    <>
                      <button onClick={() => handleResend(s._id)} className="btn-warning">Resend</button>
                      <button onClick={() => handleDelete(s._id)} className="btn-danger">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default StudentDashboard;
