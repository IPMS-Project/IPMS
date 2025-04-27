import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SubmittedReports.css";

const SubmittedReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const email = "vikash.balaji.kokku-1@ou.edu"; // Replace this with dynamic session email later
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/mine?email=${email}`);
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error("Error fetching reports", err);
        setError("Failed to load reports.");
      }
    };

    fetchReports();
  }, []);

  const handleRowClick = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  return (
    <div className="submitted-reports-container">
      <h2>Submitted Weekly Reports</h2>

      {error && <p className="error-message">{error}</p>}

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="submitted-reports-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Hours</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} onClick={() => handleRowClick(report._id)}>
                <td>{report.week}</td>
                <td>{report.hours}</td>
                <td>{report.tasks?.slice(0, 10)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="back-button" onClick={() => navigate("/weekly-report")}>
        Return
      </button>
    </div>
  );
};

export default SubmittedReports;
