import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SupervisorDashboard.css"; // Styling reused

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const [supervisedReports, setSupervisedReports] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupervisedGroups = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reports/supervised-groups`
        );
        let groups = res.data.groups || [];

        // ✅ Filter out reviewed group from localStorage
        const reviewedIndex = localStorage.getItem("reviewedGroupIndex");
        if (reviewedIndex !== null) {
          groups = groups.filter(
            (group) => group.groupIndex.toString() !== reviewedIndex
          );
          localStorage.removeItem("reviewedGroupIndex");
        }

        setSupervisedReports(groups);
      } catch (err) {
        console.error("Error fetching supervised groups:", err);
        setMessage("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisedGroups();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Coordinator Dashboard</h2>

      {message && <p className="status-msg">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3 className="section-heading">Reports Awaiting Coordinator Review</h3>
          {supervisedReports.length === 0 ? (
            <div className="empty-message-container">
              <div className="empty-message">
                No reports available for coordinator review.
              </div>
            </div>
          ) : (
            supervisedReports.map((group, idx) => (
              <div key={idx} className="cumulative-report-card">
                <h4 className="weeks-covered">
                  Weeks Covered:{" "}
                  {group.weeks?.map((w) => w.replace("Week ", "")).join(", ")}
                </h4>

                <ul className="week-report-grid">
                  {group.reports.map((report, i) => (
                    <li key={i} className="week-report-item">
                      <span>Week {report.week.replace("Week ", "")}</span>
                      <strong>Hours: {report.hours}</strong>
                      <strong>Tasks: {report.tasks}</strong>
                      <strong>
                        Supervisor Comment: {report.supervisorComments || "N/A"}
                      </strong>
                    </li>
                  ))}
                </ul>

                <button
                  className="review-button red-btn"
                  onClick={() =>
                    navigate(`/review-cumulative/${group.groupIndex}/coordinator`)
                  }
                >
                  Review & Comment
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
