import React, { useState } from 'react';

const TokenRenewal = () => {
  const [token, setToken] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setToken(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResponseMessage('');

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
        setResponseMessage({ text: 'Success: Your token has been renewed!', success: true });
      } else {
        setResponseMessage({ text: `Error: ${data.message}`, success: false });
      }
    } catch (error) {
      setResponseMessage({ text: 'Error: Unable to process your request.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-renewal-container">
      <h1>Token Renewal</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="token">Enter Your Token:</label>
          <input
            type="text"
            id="token"
            name="token"
            value={token}
            onChange={handleInputChange}
            required
            placeholder="Enter your token"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Renewing...' : 'Renew Token'}
        </button>
      </form>

      {responseMessage && (
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
