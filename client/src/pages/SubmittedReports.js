import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SubmittedReports.css";

const SubmittedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/mine`);
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="submitted-reports-container">
      <h2>Previous Weekly Reports</h2>

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="submitted-reports-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Hours</th>
              <th>Tasks</th>
              <th>Lessons</th>
              <th>Supervisor Comments</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report._id}
                className="clickable-row"
                onClick={() => navigate(`/submitted-reports/view/${report._id}`)}
              >
                <td>{report.week}</td>
                <td>{report.hours}</td>
                <td>{report.tasks}</td>
                <td>{report.lessons}</td>
                <td className="highlight-comment">
                  {report.supervisorComments || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubmittedReports;
