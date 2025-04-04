import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';

const SupervisorDashboard = () => {
    const [pendingApprovals, setPendingApprovals] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await fetch('http://localhost:5001/submissions');
                const data = await response.json();
                console.log("Fetched Submissions: ", data)
                setPendingApprovals(data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        };
        fetchSubmissions();
    }, []);

    const handleApproval = async (id) => {
        // Implement approval logic here
    };

    const handleRejection = async (id) => {
        try {
            await fetch(`http://localhost:5001/submissions/${id}`, {
                method: 'DELETE',
            });
            setPendingApprovals(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting submission:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Supervisor Dashboard</h1>
            <h2>Pending Approvals</h2>
            <ul className="pending-approvals">
                {pendingApprovals.length === 0 ? (
                    <div className="empty-message-container">
                    <div className="empty-message">No pending approvals at this time.</div>
                    </div>
                ) : (
                    pendingApprovals.map(item => (
                        <li key={item._id}>
                            {item.name} - Details: {item.details} - Status: {item.status}
                            <div>
                                <button className="approve" onClick={() => handleApproval(item._id)}>Approve</button>
                                <button className="reject" onClick={() => handleRejection(item._id)}>Reject</button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default SupervisorDashboard;