import React from "react";
import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-container">
          <img src="/OU-IPMS.png" alt="OU Logo" className="ou-logo" />
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/weekly-report">Weekly Report</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <span className="copyright">
          &copy; {new Date().getFullYear()} Internship Program Management System
        </span>
      </footer>
    </div>
  );
}

export default Layout;