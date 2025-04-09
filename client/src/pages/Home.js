import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/App.css";

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`${formData.role} sign in attempted`, formData);
  
    try {
      // TODO: Replace this with your actual API call
      // const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, formData);
  
      // Simulated login success
      const { role } = formData;
  
      // Redirect based on role
      if (role === "Student") {
        navigate("/a1-form");
      } else if (role === "Supervisor") {
        navigate("/supervisor-dashboard"); // adjust as needed
      } else if (role === "Coordinator") {
        navigate("/coordinator-dashboard"); // adjust as needed
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please check your credentials or try again.");
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
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
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
            <Link
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              {" "}
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
