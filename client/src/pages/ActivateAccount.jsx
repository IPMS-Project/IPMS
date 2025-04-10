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
        const res = await fetch(`http://localhost:5001/api/token/activate/${token}`);
        const data = await res.json();

        if (res.ok) {
            console.log("✅ Account activated successfully!")
            setMessage("✅ Account activated successfully!");
        } else {
            console.log(`❌ Activation failed: ${data.error}`)
            setMessage(`❌ Activation failed: ${data.error}`);
        }
      } catch (err) {
        console.log(`❌ Something went wrong: ${err}`)
        setMessage("❌ Something went wrong.");
      }
    };

    activateToken();
  }, [token]);

  return <div style={{ padding: "2rem" }}>{message}</div>;
};

export default ActivateAccount;