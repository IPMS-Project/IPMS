import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Student",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${formData.role} sign in attempted`, formData);

    // Navigate to the appropriate dashboard based on role
    if (formData.role === "Student") {
      navigate("/student/dashboard");
    } else if (formData.role === "Supervisor") {
      navigate("/supervisor/dashboard");
    } else if (formData.role === "Coordinator") {
      navigate("/coordinator/dashboard");
    }
  };

  return (
    <div className="content-container">
      <div className="login-container">
        <div className="illustration">
          <img src="/IPMS.jpg" alt="Student at computer" />
        </div>

        <div className="login-options">
          <h2>Sign in to continue</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">Select Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="Student">Student</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <div className="new-student">
            Don't have an account?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              {" "}
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
