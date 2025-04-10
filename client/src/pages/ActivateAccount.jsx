import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ActivateAccount = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Activating your account...");

  useEffect(() => {
    let didActivate = false;

    const activateToken = async () => {
        if (didActivate) return;
        didActivate = true;

        try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/token/activate/${token}`);
        const data = await res.json();

        if (res.ok) {
            console.log("✅ Account activated successfully!")
            setMessage("✅ Account activated successfully!");
        } else {
            console.log(`❌ Activation failed: ${data.error}`)
            setMessage(`❌ Activation failed: ${data.error}`);
        }
      } catch (err) {
        console.log(`❌ Something went wrong: ${err.data}`)
        setMessage(`❌ Something went wrong. ${err.data}`);
      }
    };

    activateToken();
  }, [token]);

  return <div style={{ padding: "2rem" }}>{message}</div>;
};

export default ActivateAccount;