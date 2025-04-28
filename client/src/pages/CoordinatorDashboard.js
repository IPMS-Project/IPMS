import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SupervisorDashboard.css"; // Reuse styling

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [reportGroups, setReportGroups] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchInternshipRequests();
    } else if (activeTab === "reports") {
      fetchReportGroups();
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

  const fetchReportGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/supervised-groups`);
      console.log("Fetched report groups:", response.data);
      setReportGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleReviewClick = (group) => {
    localStorage.setItem("reviewEmail", group.email);
    localStorage.setItem("reviewWeeks", JSON.stringify(group.weeks));
    navigate(`/coordinator-review/${group.groupIndex}`);
  };

  const getSupervisorComment = (group) => {
    if (!group.reports || group.reports.length === 0) {
      return "No comment provided.";
    }
    const comments = group.reports
      .map(r => r.supervisorComments?.trim())
      .filter(c => c && c !== "");
    const uniqueComments = [...new Set(comments)];

    if (uniqueComments.length === 1) {
      return uniqueComments[0];
    } else if (uniqueComments.length > 1) {
      return uniqueComments.join(", ");
    } else {
      return "No comment provided.";
    }
  };

  const formatWeeks = (weeks) => {
    return weeks.map(w => w.split(" ")[1]).join(", ");
  };

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "2rem" }}>
        Coordinator Dashboard
      </h2>

      {/* Tabs */}
      <div className="tab-toggle" style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("requests")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #9b111e",
            backgroundColor: activeTab === "requests" ? "#9b111e" : "white",
            color: activeTab === "requests" ? "white" : "#9b111e",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Internship Requests
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #9b111e",
            backgroundColor: activeTab === "reports" ? "#9b111e" : "white",
            color: activeTab === "reports" ? "white" : "#9b111e",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Weekly Reports Review
        </button>
      </div>

      {/* Internship Requests */}
      {activeTab === "requests" && (
        <>
          {loadingRequests ? (
            <p>Loading internship requests...</p>
          ) : (
            <table className="dashboard-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Company</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} style={{ textAlign: "center" }}>
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

      {/* Weekly Reports Review */}
      {activeTab === "reports" && (
        <>
          {loadingReports ? (
            <p>Loading weekly reports...</p>
          ) : (
            <>
              {reportGroups.length === 0 ? (
                <div className="empty-message-container" style={{ textAlign: "center", marginTop: "2rem" }}>
                  <p>No pending groups for review.</p>
                </div>
              ) : (
                reportGroups.map((group) => (
                  <div
                    key={group.groupIndex}
                    style={{
                      backgroundColor: "white",
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                      padding: "2rem",
                      marginBottom: "2rem",
                      borderRadius: "12px",
                      maxWidth: "700px",
                      marginInline: "auto",
                      transition: "transform 0.3s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <h3 style={{ color: "#9b111e", marginBottom: "15px", textAlign: "center" }}>
                      Weeks: {formatWeeks(group.weeks)}{group.reports?.[0]?.name ? ` of ${group.reports[0].name}` : ""}
                    </h3>

                    <div style={{ marginBottom: "20px" }}>
                      <strong>
                        {group.reports?.[0]?.supervisorName ? `(${group.reports[0].supervisorName})` : ""} Supervisor's Comment:
                      </strong>
                      <div
                        style={{
                          backgroundColor: "#f9f9f9",
                          padding: "12px",
                          borderRadius: "8px",
                          marginTop: "8px",
                          fontStyle: "italic",
                          color: "#555",
                        }}
                      >
                        {getSupervisorComment(group)}
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleReviewClick(group)}
                        style={{
                          padding: "10px 24px",
                          borderRadius: "8px",
                          backgroundColor: "#9b111e",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "16px",
                          border: "none",
                          cursor: "pointer",
                          transition: "background-color 0.3s, transform 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#7e0e18";
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "#9b111e";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        Review & Comment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
