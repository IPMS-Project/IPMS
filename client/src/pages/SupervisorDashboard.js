import React, { useEffect, useState } from "react";
import axios from "axios";

const SupervisorDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const url = "http://localhost:5001"  

    useEffect(() => {
	fetchPendingSubmissions();
    }, []);

    const fetchPendingSubmissions = async () => {
	try {
	    const response = await axios.get(url + "/api/submissions/pending");
	    setSubmissions(response.data);
	} catch (err) {
	    console.error("Error fetching submissions:", err);
	}
    };

    const handleDecision = async (id, action) => {
	try {
	    const endpoint = url + `/api/submissions/${id}/${action}`;
	    await axios.post(endpoint);
	    alert(`Submission ${action}d successfully!`);
	    fetchPendingSubmissions(); // refresh list
	} catch (err) {
	    console.error("Error updating submission:", err);
	}
    };

    return (
	<div style={{ padding: "20px" }}>
	    <h2>Supervisor Dashboard</h2>
	    <p>Welcome, Supervisor!</p>

	    <h3>Pending Submissions</h3>
	    {submissions.length === 0 ? (
		<p>No pending submissions.</p>
	    ) : (
		<div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
		    <div style={{
			     display: "grid",
			     gridTemplateColumns: "1fr 2fr 2fr 2fr",
			     fontWeight: "bold",
			     backgroundColor: "#f2f2f2",
			     padding: "12px",
			     borderRadius: "8px",
			     border: "1px solid #ccc"
			 }}>
			<div>ID</div>
			<div>Title</div>
			<div>Submitted By</div>
			<div>Action</div>
		    </div>

		    {submissions.map((submission) => (
			<div
			    key={submission._id}
			    style={{
				display: "grid",
				gridTemplateColumns: "1fr 2fr 2fr 2fr",
				padding: "12px",
				border: "1px solid #ddd",
				borderRadius: "8px",
				backgroundColor: "#fff",
				alignItems: "center",
				boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
			    }}
			>
			    <div>{submission._id}</div>
			    <div>{submission.title || "N/A"}</div>
			    <div>{submission.studentName || "N/A"}</div>
			    <div style={{ display: "flex", gap: "8px" }}>
				<button
				    style={{
					padding: "6px 12px",
					borderRadius: "4px",
					border: "none",
					backgroundColor: "#4CAF50",
					color: "#fff",
					cursor: "pointer"
				    }}
				    onClick={() => handleDecision(submission._id, "approve")}
				>
				    Approve
				</button>
				<button
				    style={{
					padding: "6px 12px",
					borderRadius: "4px",
					border: "none",
					backgroundColor: "#f44336",
					color: "#fff",
					cursor: "pointer"
				    }}
				    onClick={() => handleDecision(submission._id, "reject")}
				>
				    Reject
				</button>
			    </div>
			</div>
		    ))}
		</div>
	    )}
	</div>
    );
};

export default SupervisorDashboard;
