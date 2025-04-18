import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TokenRenewal = () => {
  const { token } = useParams();
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renewToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/renew`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setResponseMessage({ text: '✅ Success: Your token has been renewed!', success: true });
        } else {
          setResponseMessage({ text: `❌ Error: ${data.message}`, success: false });
        }
      } catch (error) {
        setResponseMessage({ text: '❌ Error: Unable to process your request.', success: false });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      renewToken();
    } else {
      setResponseMessage({ text: '❌ Error: No token found in the URL.', success: false });
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="token-renewal-container">
      <h1>Token Renewal</h1>
      {loading ? (
        <p>⏳ Processing your token renewal...</p>
      ) : (
        <div
          className={`response-message ${responseMessage.success ? 'success' : 'error'}`}
          style={{ marginTop: '20px' }}
        >
          {responseMessage.text}
        </div>
      )}
    </div>
  );
};

export default TokenRenewal;
