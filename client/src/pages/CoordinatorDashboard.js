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

  const approveForm = async (formId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/approval/form/${formId}/approve`
      );
      alert("Form approved successfully!");
      fetchRequests(); // refresh the list after approving
    } catch (err) {
      console.error("Failed to approve form:", err);
      alert("Failed to approve form!");
    }
  };

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

      {requests.length === 0 ? (
        <p>No Pending Requests</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="request-card">
            <p>Company: {req.workplace.name}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-approve"
                onClick={() => approveForm(req._id)}
              >
                Approve
              </button>
              <button
                className="btn-view"
                onClick={() => navigate(`/coordinator/request/${req._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CoordinatorDashboard;
