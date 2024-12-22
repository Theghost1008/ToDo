import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

function RegisterUserPage() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const registerUser = async () => {
      try {
        const response = await axios.post("/users/register");
        if (response.status === 201 && response.data.success) {
          setSuccess(true);
          setTimeout(() => navigate("/"), 2000)
        }
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    };

    registerUser();
  }, [navigate]);

  return (
    <div className="register-container">
      {error ? (
        <div className="error">
          <h1>Oops! Something went wrong</h1>
          <p>{error}</p>
          <button onClick={() => navigate("/")}>Go Back to Login</button>
        </div>
      ) : success ? (
        <div className="success">
          <h1>Registration Successful!</h1>
          <p>You will be redirected to the login page shortly.</p>
          <div className="animated-popup">
            <span role="img" aria-label="success">
              🎉
            </span>
          </div>
        </div>
      ) : (
        <div className="loading">
          <h1>Processing your registration...</h1>
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default RegisterUserPage;
