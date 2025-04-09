import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("-");
  const [responseMessage, setResponseMessage] = useState("");

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/createUser`,
        {
          userName,
          email,
          password,
          role,
        }
      );
      setResponseMessage(response.data.message);
      // Reset form after successful submission
      setEmail("");
      setPassword("");

      // Redirect based on role after successful signup
setTimeout(() => {
  if (role === "student") {
    navigate("/a1-form");

  } else {
    navigate("/");
  }
}, 2000);
    } catch (error) {
      console.error("Error creating user:", error);
      setResponseMessage(
        "Failed to create user, please check the server connection"
      );
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up for IPMS</h1>
      <p>
        Create your account to access the Internship Program Management System
      </p>

      {responseMessage && (
        <div className="response-message">{responseMessage}</div>
      )}

      <form onSubmit={createUser} className="signup-form">
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="-">Please select your role</option>
            <option value="student">Student</option>
            <option value="supervisor">Supervisor</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="userName">User Name</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>

      <div className="login-link">
        Already have an account?{" "}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}

export default SignUp;
