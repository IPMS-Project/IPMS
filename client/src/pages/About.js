import React from "react";
import "../styles/About.css";
import bannerImg from "../img/ipms-banner.jpg";
import studentImg from '../img/student.jpg';
import supervisorImg from '../img/supervisor.jpg';
import coordinatorImg from '../img/coordinator.jpg';

const About = () => {
  return (
    <div className="about-wrapper">
      <h1 className="about-heading">About IPMS</h1>

      <img src={bannerImg} alt="IPMS banner" className="about-banner" />

      <p className="about-summary">
        The <strong>Internship Program Management System (IPMS)</strong> is an all-in-one solution designed to streamline and support every stage of the Computer Science internship experience at the University of Oklahoma.
      </p>

      <div className="section">
        <div className="feature-cards">
          <div className="feature-card">
            <span className="icon">🔐</span>
            <h3>Role-based Login</h3>
            <p>Students, supervisors, and coordinators get access to tools tailored to their role.</p>
          </div>
          <div className="feature-card">
            <span className="icon">🧾</span>
            <h3>Token-based Authentication</h3>
            <p>Secure token login system — no passwords. Tokens last the full semester.</p>
          </div>
          <div className="feature-card">
            <span className="icon">🔄</span>
            <h3>Streamlined Communication</h3>
            <p>Automatic reminders and workflows connect all users seamlessly.</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-heading">Who Uses IPMS?</h2>
        <div className="user-role-cards">
          <div className="user-card">
          <img src={studentImg} alt="student" className="user-card" />
            <h4>Students</h4>
            <p>Submit requests, track weekly progress, and complete your internship journey.</p>
          </div>
          <div className="user-card">
          <img src={supervisorImg} alt="supervisor" className="user-card" />
            <h4>Supervisors</h4>
            <p>Review forms, approve progress, and evaluate student performance.</p>
          </div>
          <div className="user-card">          
            <img src={coordinatorImg} alt="Coordinator" className="user-card" />
            <h4>Coordinators</h4>
            <p>Oversee submissions, grade final reports, and manage workflows.</p>
          </div>
        </div>
      </div>

      <div className="cta-footer">
        <h3>Get in Touch</h3>
        <p>Interested in learning more or need assistance? Contact us!</p>
        <a href="/contact" className="cta-button">Contact Page</a>
      </div>
    </div>
  );
};

export default About;