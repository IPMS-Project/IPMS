// src/components/ProtectedRouteStudent.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRouteStudent = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("ipmsUser"));
  
    // Check if user info is missing
    if (!user || !user.id || !user.fullName) {
      return <Navigate to="/" replace />;
    }
  
    return children;
  };

export default ProtectedRouteStudent;
