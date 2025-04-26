import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SupervisorDashboard.css"; 
const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests"); // 'requests' or 'reports'
  const navigate = useNavigate();
  // TEAM A's Internship Requests Logic
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchInternshipRequests();
    }
  }, [activeTab]);

  const fetchInternshipRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/coordinator/requests`);
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching internship requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };
  // Group D's Weekly Report Review Logic

  const [reportGroups, setReportGroups] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReportGroups();
    }
  }, [activeTab]);

  const fetchReportGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/supervised-groups`);
      const filtered = res.data?.groups?.filter(group => {
        const key = `coordinator_reviewed_${group.groupIndex}`;
        return !localStorage.getItem(key);
      });
      setReportGroups(filtered || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleReviewClick = (group) => {
    localStorage.setItem(`coordinator_reviewed_${group.groupIndex}`, "true");
    navigate(`/review-cumulative/${group.groupIndex}`);
  };

  
  // Render UI
  
  return (
    <div className="dashboard-container">
      <h2>Coordinator Dashboard</h2>

      {/* Tabs */}
      <div className="tab-toggle">
        <button onClick={() => setActiveTab("requests")} className={activeTab === "requests" ? "active" : ""}>Internship Requests</button>
        <button onClick={() => setActiveTab("reports")} className={activeTab === "reports" ? "active" : ""}>Weekly Reports Review</button>
      </div>

      {/* Tab: Internship Requests */}
      {activeTab === "requests" && (
        <>
          {loadingRequests ? <p>Loading...</p> : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Company</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id}>
                    <td>{req.studentName}</td>
                    <td>{req.studentId}</td>
                    <td>{req.companyName}</td>
                    <td>{req.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Tab: Weekly Reports Review */}
      {activeTab === "reports" && (
        <>
          {loadingReports ? <p>Loading reports...</p> : (
            reportGroups.length === 0
              ? <p>No reports to review</p>
              : reportGroups.map(group => (
                <div className="report-group-card" key={group.groupIndex}>
                  <h4>Weeks: {group.weeks?.join(", ")}</h4>
                  <ul>
                    {group.reports.map((r, i) => (
                      <li key={i}>Week {r.week} — Hours: {r.hours} — Tasks: {r.tasks}</li>
                    ))}
                  </ul>
                  <button onClick={() => handleReviewClick(group)}>Review & Comment</button>
                </div>
              ))
          )}
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
