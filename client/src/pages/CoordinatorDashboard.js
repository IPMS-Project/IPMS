import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SupervisorDashboard.css";

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const navigate = useNavigate();

  // Internship Requests (Form A1)
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchInternshipRequests();
    }
  }, [activeTab]);

  const fetchInternshipRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/coordinator/requests`
      );
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching internship requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Weekly Reports (Form A2)
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchWeeklyReports();
    }
  }, [activeTab]);

  const fetchWeeklyReports = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/coordinator/reports`
      );
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Job Evaluations (Form A3)
  const [evaluations, setEvaluations] = useState([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(true);

  useEffect(() => {
    if (activeTab === "evaluations") {
      fetchEvaluations();
    }
  }, [activeTab]);

  const fetchEvaluations = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/coordinator/evaluations`
      );
      setEvaluations(res.data || []);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Coordinator Dashboard</h2>

      {/* Tabs */}
      <div className="tab-toggle">
        <button
          onClick={() => setActiveTab("requests")}
          className={activeTab === "requests" ? "active" : ""}
        >
          Internship Requests
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={activeTab === "reports" ? "active" : ""}
        >
          Weekly Reports Review
        </button>
        <button
          onClick={() => setActiveTab("evaluations")}
          className={activeTab === "evaluations" ? "active" : ""}
        >
          Job Evaluations
        </button>
      </div>

      {/* Internship Requests Tab */}
      {activeTab === "requests" && (
        <>
          {loadingRequests ? (
            <p>Loading requests...</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.student?.fullName || "-"}</td>
                    <td>{req.workplace?.name || "-"}</td>
                    <td>{req.coordinator_status || "-"}</td>
                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() =>
                          navigate(`/coordinator/request/${req._id}`)
                        }
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Weekly Reports Tab */}
      {activeTab === "reports" && (
        <>
          {loadingReports ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p>No reports to review</p>
          ) : (
            reports.map((report) => (
              <div className="report-group-card" key={report._id}>
                <h4>Week: {report.week}</h4>
                <p>Hours: {report.hours}</p>
                <p>Tasks: {report.tasks}</p>
              </div>
            ))
          )}
        </>
      )}

      {/* Job Evaluations Tab */}
      {activeTab === "evaluations" && (
        <>
          {loadingEvaluations ? (
            <p>Loading evaluations...</p>
          ) : evaluations.length === 0 ? (
            <p>No evaluations pending</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Internee Name</th>
                  <th>Internee Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evalItem) => (
                  <tr key={evalItem._id}>
                    <td>{evalItem.interneeName}</td>
                    <td>{evalItem.interneeEmail}</td>
                    <td>
                      <button
                        className="review-btn"
                        onClick={() =>
                          navigate(`/coordinator/evaluation/${evalItem._id}`)
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
