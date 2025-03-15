import { useState } from "react";
import axios from "axios";
import "./styles/App.css";
import React from 'react';
import './App.css';

function App() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [semester, setSemester] = useState("");
  const [academicAdvisor, setAcademicAdvisor] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const createUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users`,
        {
          fullName,
          email,
          semester,
          academicAdvisor,
        }
      );
      setResponseMessage(response.data.message);
    } catch (error) {
      console.error("Error creating user:", error);
      setResponseMessage(
        "Failed to create user, please check the server connection"
      );
    }
  };

  return (
    <div className="App">
      <h1>IPMS</h1>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter OU Email"
      />
      <input
        type="text"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        placeholder="Semester (e.g., Spring 2025)"
      />
      <input
        type="text"
        value={academicAdvisor}
        onChange={(e) => setAcademicAdvisor(e.target.value)}
        placeholder="Academic Advisor"
      />
      <button onClick={createUser}>Create User</button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default App;
