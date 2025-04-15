import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CoordinatorRequestDetailView.css";

const CoordinatorRequestDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/coordinator/request/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  const handleApprove = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/coordinator/request/${id}/approve`
      );
      alert(res.data.message);
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving request.");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return alert("Rejection reason required!");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/coordinator/request/${id}/reject`,
        { reason }
      );
      alert(res.data.message);
      navigate("/coordinator-dashboard");
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting request.");
    }
  };

  if (!data) return <h2>Loading...</h2>;

  const { requestData, supervisorStatus } = data;

  return (
    <div className="request-form">
      <h2 className="dashboard-title">Internship Request Details</h2>

      <div className="dashboard-card">
        <p>
          <b>Student:</b> {requestData.student.userName}
        </p>
        <p>
          <b>Email:</b> {requestData.student.email}
        </p>
        <p>
          <b>Company:</b> {requestData.workplace.name}
        </p>
        <p>
          <b>Supervisor Status:</b> {supervisorStatus}
        </p>

        <h3 className="section-title">Tasks & CS Outcomes</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Outcomes</th>
            </tr>
          </thead>
          <tbody>
            {requestData.tasks.map((task, idx) => (
              <tr key={idx}>
                <td>{task.description}</td>
                <td>{task.outcomes.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="action-buttons" style={{ marginTop: "20px" }}>
          <button className="approve-btn" onClick={handleApprove}>
            Approve
          </button>
          <button className="reject-btn" onClick={handleReject}>
            Reject
          </button>
          <button
            className="back-btn"
            onClick={() => navigate("/coordinator-dashboard")}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorRequestDetailView;
