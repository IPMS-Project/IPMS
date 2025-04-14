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
          <b>Student Name:</b> {requestData.student.userName}
        </p>
        <p>
          <b>Student Email:</b> {requestData.student.email}
        </p>
        <p>
          <b>Company:</b> {requestData.workplace.name}
        </p>
        <p>
          <b>Company Website:</b> {requestData.workplace.website}
        </p>
        <p>
          <b>Company Phone:</b> {requestData.workplace.phone}
        </p>
        <p>
          <b>Internship Advisor:</b> {requestData.internshipAdvisor.name} (
          {requestData.internshipAdvisor.email})
        </p>
        <p>
          <b>Credit Hours:</b> {requestData.creditHours}
        </p>
        <p>
          <b>Start Date:</b>{" "}
          {new Date(requestData.startDate).toLocaleDateString()}
        </p>
        <p>
          <b>End Date:</b> {new Date(requestData.endDate).toLocaleDateString()}
        </p>
        <p>
          <b>Supervisor Approval Status:</b> {supervisorStatus}
        </p>

        <h3 className="section-title">Tasks & CS Outcomes</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Task Description</th>
              <th>CS Outcomes</th>
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
