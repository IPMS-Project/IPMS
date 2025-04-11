import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import StudentIcon from "../Icons/StudentIcon";
import CoordinatorIcon from "../Icons/CoordinatorIcon";
import SupervisorIcon from "../Icons/SupervisorIcon";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState("-");
  const [responseMessage, setResponseMessage] = useState("");
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [ouEmail, setOuEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [semester, setSemester] = useState("");
  const [academicAdvisor, setAcademicAdvisor] = useState("");
  const [agreed, setAgreed] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (value) => {
    setPassword(value);

    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);

    if (value.length >= 8 && hasNumber && hasSymbol && hasUpper && hasLower) {
      setPasswordStrength("Strong");
    } else if (value.length >= 6 && (hasNumber || hasSymbol)) {
      setPasswordStrength("Medium");
    } else {
      setPasswordStrength("Weak");
    }
  };

  const passwordsMatch = password === confirmPassword;

  const createUser = async (e) => {
    console.log("createUser() called");

    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/token/request`,
        {
          fullName,
          ouEmail,
          password,
          semester,
          academicAdvisor: role === "student" ? academicAdvisor : "",
          role,
        }
      );
      console.log("Signup response:", response.data);
      if (response.data && response.data.user) {
        localStorage.setItem("user", JSON.stringify({ user: response.data.user }));
      }

      if (role === "student") {
        setResponseMessage("Token requested and email sent.");
      } else {
        setResponseMessage("Account created successfully.");
      }

      // Reset form after successful submission
      setFullName("");
      setOuEmail("");
      setPassword("");
      setConfirmPassword("");
      setSemester("");
      setAcademicAdvisor("");

      // Redirect to home after successful signup
      setTimeout(() => {
        navigate("/");
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
      {responseMessage && (
        <div className="response-message">{responseMessage}</div>
      )}

      <form onSubmit={createUser} className="signup-form">
        {step === 1 && (
          <div className="role-selection">
            <h2 style={{ textAlign: "center" }}>Create Your Account</h2>
            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontWeight: "500",
                fontSize: "1rem",
              }}
            >
              Who are you? Select your role to continue
            </p>

            <div className="role-cards" style={{ marginTop: "1rem" }}>
              {[
                { role: "student", Icon: StudentIcon },
                { role: "supervisor", Icon: SupervisorIcon },
                { role: "coordinator", Icon: CoordinatorIcon },
              ].map(({ role: r, Icon }) => (
                <div
                  key={r}
                  className={`role-card ${role === r ? "selected" : ""}`}
                  onClick={() => setRole(r)}
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

            <button
              type="button"
              className="submit-button"
              style={{ marginTop: "2rem" }}
              disabled={role === "-"}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
                Welcome
              </h2>
              <p style={{ fontSize: "1rem", color: "#444" }}>
                To proceed, enter your details below
              </p>
            </div>
            <div className="step-two-header">
              <button
                className="back-button"
                onClick={() => setStep(1)}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#2f4f4f",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "1rem",
                }}
              >
                <span>&larr;</span> Back
              </button>

              <div
                className="role-badge"
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#8B2D2D",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                You selected: {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="userName">Full Name</label>
              <input
                type="text"
                id="userName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={ouEmail}
                onChange={(e) => setOuEmail(e.target.value)}
                placeholder="Enter your university email"
                required
              />
            </div>
            <div className="password-row">
              <div className="form-group password-col">
                <label htmlFor="password">New password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="form-control"
                  />
                  <span className="eye-icon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {password && (
                  <>
                    <div className="strength-bar">
                      {[1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`bar-segment ${
                            passwordStrength === "Strong"
                              ? "strong"
                              : passwordStrength === "Medium" && index < 3
                              ? "medium"
                              : passwordStrength === "Weak" && index === 1
                              ? "weak"
                              : ""
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p
                      className={`strength-text ${passwordStrength.toLowerCase()}`}
                      style={{ margin: "0" }}
                    >
                      {passwordStrength === "Strong"
                        ? "Strong"
                        : passwordStrength === "Medium"
                        ? "Weak"
                        : "Very Weak"}
                    </p>
                  </>
                )}
              </div>

              <div className="form-group password-col">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="form-control"
                />
                {!passwordsMatch && confirmPassword.length > 0 && (
                  <p className="match-warning">Passwords do not match!</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                <option value="">Select your semester</option>
                <option value="Fall 2025">Fall 2025</option>
                <option value="Spring 2025">Spring 2025</option>
                <option value="Summer 2025">Summer 2025</option>
              </select>
            </div>

            {role === "student" && (
                  <div className="form-group">
                    <label htmlFor="academicAdvisor">Academic Advisor</label>
                    <input
                      type="text"
                      id="advisor"
                      value={academicAdvisor}
                      onChange={(e) => setAcademicAdvisor(e.target.value)}
                      placeholder="Enter your academic advisor's name"
                      required
                    />
                  </div>
                )}

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                />{" "}
                I agree to the Internship Guidelines
              </label>
            </div>

            <button type="submit" className="submit-button">
              Create Account
            </button>
          </>
        )}
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