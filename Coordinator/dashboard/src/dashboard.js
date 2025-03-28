// src/dashboard.js
import React, { useState } from 'react';
import './dashboard.css';
import SubmissionForm from './submitForm';

const SupervisorDashboard = () => {
    const [pendingApprovals, setPendingApprovals] = useState([
        { id: 1, name: 'Submission 1', status: 'Pending' },
        { id: 2, name: 'Submission 2', status: 'Pending' },
        { id: 3, name: 'Submission 3', status: 'Pending' },
    ]);

    const handleApproval = (id) => {
        setPendingApprovals(prev => 
            prev.map(item => 
                item.id === id ? { ...item, status: 'Approved' } : item
            )
        );
    };

    const handleRejection = (id) => {
        setPendingApprovals(prev => 
            prev.map(item => 
                item.id === id ? { ...item, status: 'Rejected' } : item
            )
        );
    };

    // const addSubmission = (submission) => {
    //     setPendingApprovals(prev => [
    //         ...prev,
    //         { id: prev.length + 1, ...submission }
    //     ]);
    // };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Dashboard</h1>
            {/* <SubmissionForm onSubmit={addSubmission} /> */}
            <h2>Pending Approvals</h2>
            <ul className="pending-approvals">
                {pendingApprovals.map(item => (
                    <li key={item.id}>
                        {item.name} - Status: {item.status}
                        <div>
                            <button onClick={() => handleApproval(item.id)}>Approve</button>
                            <button onClick={() => handleRejection(item.id)}>Reject</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SupervisorDashboard;

// // src/SupervisorDashboard.js
// import React, { useEffect, useState } from 'react';
// import './dashboard.css';

// const SupervisorDashboard = () => {
//     const [pendingApprovals, setPendingApprovals] = useState([]);

//     useEffect(() => {
//         const fetchSubmissions = async () => {
//             const response = await fetch('https://your-api-url.com/submissions');
//             const data = await response.json();
//             setPendingApprovals(data);
//         };
//         fetchSubmissions();
//     }, []);

//     const handleApproval = async (id) => {
//         await fetch(`https://your-api-url.com/submissions/${id}/approve`, {
//             method: 'PATCH',
//         });
//         setPendingApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
//     };

//     const handleRejection = async (id) => {
//         await fetch(`https://your-api-url.com/submissions/${id}/reject`, {
//             method: 'PATCH',
//         });
//         setPendingApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected' } : item));
//     };

//     return (
//         <div className="dashboard-container">
//             <h1 className="dashboard-title">Supervisor Dashboard</h1>
//             <h2>Pending Approvals</h2>
//             <ul className="pending-approvals">
//                 {pendingApprovals.map(item => (
//                     <li key={item.id}>
//                         {item.name} - Details: {item.details} - Status: {item.status}
//                         <div>
//                             <button onClick={() => handleApproval(item.id)}>Approve</button>
//                             <button onClick={() => handleRejection(item.id)}>Reject</button>
//                         </div>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default SupervisorDashboard;
