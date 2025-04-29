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
        //const email = "rohan.mukka-1@ou.edu"; // Later replace with session email
        const ipmsUser = localStorage.getItem("ipmsUser");
        const email = ipmsUser ? JSON.parse(ipmsUser).email : null;
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/mine?email=${email}`);
        if (res.data.success) {
          setReports(res.data.reports);
        } else {
          setError("Failed to fetch reports.");
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
              <th>Lessons</th> {/* ✅ Added Lessons */}
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} onClick={() => handleRowClick(report._id)}>
                <td>{report.week}</td>
                <td>{report.hours}</td>
                <td>{report.tasks?.length > 20 ? `${report.tasks.slice(0, 20)}...` : report.tasks}</td>
                <td>{report.lessons?.length > 20 ? `${report.lessons.slice(0, 20)}...` : report.lessons}</td> {/* ✅ Lessons shown properly */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button className="back-button" onClick={() => navigate("/weekly-report")}>
          Return
        </button>
      </div>
    </div>
  );
};

export default SubmittedReports;
