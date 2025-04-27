import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SupervisorDashboard.css";

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests"); // 'requests', 'reports', 'manualReviews'
  const navigate = useNavigate();

  // Internship Requests
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Weekly Reports
  const [reportGroups, setReportGroups] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Manual Reviews (Failed A.1 Forms)
  const [manualReviewForms, setManualReviewForms] = useState([]);
  const [loadingManualReviews, setLoadingManualReviews] = useState(true);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchInternshipRequests();
    } else if (activeTab === "reports") {
      fetchReportGroups();
    } else if (activeTab === "manualReviews") {
      fetchManualReviewForms();
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

  const fetchManualReviewForms = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/coordinator/manual-review-a1`);
      setManualReviewForms(res.data || []);
    } catch (err) {
      console.error("Error fetching manual review forms:", err);
    } finally {
      setLoadingManualReviews(false);
    }
  };

  const handleReviewClick = (group) => {
    localStorage.setItem(`coordinator_reviewed_${group.groupIndex}`, "true");
    navigate(`/review-cumulative/${group.groupIndex}`);
  };

  const handleApprove = async (formId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/coordinator/manual-review-a1/${formId}/approve`);
      alert('Form approved successfully!');
      fetchManualReviewForms(); // Refresh after action
    } catch (error) {
      console.error('Error approving form', error);
    }
  };

  const handleReject = async (formId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) {
      alert("Rejection cancelled.");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/coordinator/manual-review-a1/${formId}/reject`, { reason });
      alert('Form rejected successfully!');
      fetchManualReviewForms(); // Refresh after action
    } catch (error) {
      console.error('Error rejecting form', error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Coordinator Dashboard</h2>

      {/* Tabs */}
      <div className="tab-toggle">
        <button onClick={() => setActiveTab("requests")} className={activeTab === "requests" ? "active" : ""}>Internship Requests</button>
        <button onClick={() => setActiveTab("reports")} className={activeTab === "reports" ? "active" : ""}>Weekly Reports Review</button>
        <button onClick={() => setActiveTab("manualReviews")} className={activeTab === "manualReviews" ? "active" : ""}>Manual Reviews (A.1)</button>
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

      {/* Tab: Manual Reviews */}
      {activeTab === "manualReviews" && (
        <>
          {loadingManualReviews ? <p>Loading Manual Reviews...</p> : (
            manualReviewForms.length === 0
              ? <p>No forms requiring manual review.</p>
              : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Internship Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualReviewForms.map(form => (
                      <tr key={form._id}>
                        <td>{form.studentName}</td>
                        <td>{form.studentEmail}</td>
                        <td>{form.internshipDetails?.position || "N/A"}</td>
                        <td>
                          <button onClick={() => handleApprove(form._id)}>Approve</button>
                          <button onClick={() => handleReject(form._id)} style={{ marginLeft: "10px" }}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          )}
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
