import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to the Internship Portal</h1>
      <p>This is the homepage.</p>
      <Link to="/signin">
        <button style={{ padding: "10px 20px", marginTop: "20px" }}>
          Go to Sign In
        </button>
      </Link>
    </div>
  );
};

export default Home;