import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/CoordinatorRequestDetailView.css";

const CoordinatorRequestDetailView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/coordinator/request/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [id]);

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
      </div>
    </div>
  );
};

export default CoordinatorRequestDetailView;
