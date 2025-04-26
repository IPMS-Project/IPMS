import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedSupervisor = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("ipmsUser"));
    return user && user.role === "supervisor" ? children : <Navigate to="/" />;
  };

  export default ProtectedSupervisor;