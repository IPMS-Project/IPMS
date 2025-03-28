// src/App.js
import React from 'react';
import logo from './OUlogo.jpg';
import './App.css';
import SupervisorDashboard from './dashboard.js';

const App = () => {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    IPMS Supervisor Overview
                </p>
            </header>
            <SupervisorDashboard />
        </div>
    );
};

export default App;
