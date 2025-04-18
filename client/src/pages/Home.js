import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/App.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/login.css";
import StudentIcon from "../Icons/StudentIcon";
import CoordinatorIcon from "../Icons/CoordinatorIcon";
import SupervisorIcon from "../Icons/SupervisorIcon";
import Swal from "sweetalert2";

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email: ouEmail, password, role } = formData;

    if (!ouEmail || !password || !role) {
      return Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please fill in all fields to sign in 💫",
      });
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/token/user-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ouEmail, password, role }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const user = data.user;

        // Store only required fields
        const limitedUserInfo = {
          fullName: user.fullName,
          id: user._id,
          email:user.ouEmail
        };
        
        localStorage.setItem("ipmsUser", JSON.stringify(limitedUserInfo));

        // Swal.fire({
        //   icon: "success",
        //   title: "Login Successful",
        //   text: `Welcome back, `,
        // });

        navigate("/student-dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Something went wrong ",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "We couldn't reach the server 😢 Try again later!",
      });
    }
  };

  return (
    <div className="content-container">
      <div className="login-container">
        <div className="illustration">
          <img src="/IPMS.jpg" alt="Student at computer" />
        </div>

        <div className="login-options">
          <h2 style={{ fontWeight: "600", fontSize: "1.9rem" }}>
            Welcome back
          </h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontWeight: "500", marginBottom: "0.5rem" }}>
                Select Your Role
              </label>
              <div className="role-cards" style={{ marginTop: "0.5rem" }}>
                {[
                  { role: "student", Icon: StudentIcon },
                  { role: "supervisor", Icon: SupervisorIcon },
                  { role: "coordinator", Icon: CoordinatorIcon },
                ].map(({ role: r, Icon }) => (
                  <div
                    key={r}
                    className={`role-card ${
                      formData.role === r ? "selected" : ""
                    }`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        role: r,
                      })
                    }
                  >
                    <Icon />
                    <p className="role-label">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </p>
                    <span
                      className="info-icon"
                      title={
                        r === "student"
                          ? "Students request internships and submit weekly reports."
                          : r === "supervisor"
                          ? "Supervisors review and approve student progress."
                          : "Coordinators manage the internship workflow and approvals."
                      }
                    ></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group clean-input">
              <label htmlFor="email">
                <FaEnvelope
                  style={{ marginRight: "6px", verticalAlign: "middle" }}
                />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group clean-input">
              <label htmlFor="password">
                <FaLock
                  style={{ marginRight: "6px", verticalAlign: "middle" }}
                />
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <span
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div
              className="form-subtext"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              <label className="d-flex align-items-center">
                <input type="checkbox" style={{ marginRight: "6px" }} />
                Remember me
              </label>
              <Link
                to="/"
                style={{
                  color: "#7f1d1d",
                  fontWeight: "500",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <div className="new-student" style={{ marginTop: "1.2rem" }}>
            Don't have an account?
            <Link
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              style={{
                color: "#7f1d1d",
                fontWeight: "600",
                marginLeft: "4px",
                textDecoration: "underline",
              }}
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;