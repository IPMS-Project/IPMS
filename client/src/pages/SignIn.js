import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Supervisor");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
        role,
      });

      console.log("Login Success:", response.data);
      alert("Login successful");

      if (role === "Supervisor") navigate("/supervisor-dashboard");
      else if (role === "Coordinator") navigate("/coordinator-dashboard");
      else navigate("/");

    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Supervisor">Supervisor</option>
            <option value="Coordinator">Coordinator</option>
          </select>
        </label>
        <br /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;