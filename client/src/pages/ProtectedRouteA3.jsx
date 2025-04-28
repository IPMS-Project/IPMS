import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRouteA3 = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("ipmsUser"));
  const [eligible, setEligible] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user?.email) {
        setEligible(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reports/A3-eligibility`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          }
        );
        const data = await response.json();
        setEligible(data.eligibleForA3);
      } catch (err) {
        setEligible(false);
      }
      setLoading(false);
    };

    checkEligibility();
  }, [user]);

  if (loading) return <div>Checking eligibility...</div>;

  if (!eligible) {
    // Not eligible, redirecting to student dashboard
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};

export default ProtectedRouteA3;
