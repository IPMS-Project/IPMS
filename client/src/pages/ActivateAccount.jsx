import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Activating your account...");

  const FRONTEND_URL = process.env.FRONTEND_URL;

  useEffect(() => {
    fetch(`${FRONTEND_URL}/activate/${token}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Activation failed. Please try again or contact support."
          );
        }
        return res.json();
      })
      .then((data) => {
        setMessage("Your account has been activated successfully!");

        setTimeout(() => {
          navigate("/activation-success"); // this route page needs to be created.
        }, 5000);
      })
      .catch((err) => {
        setMessage(err.message);
      });
  }, [token, navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default ActivateAccount;
