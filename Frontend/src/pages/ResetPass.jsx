import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

function ResetPass() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP, Step 3: Reset Password
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRequestOTP = async (event) => {
    event.preventDefault();
    try {
      await axios.post("/users/request-otp", { email });
      alert("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    try {
      await axios.post("/users/verify-otp", { email, otp });
      alert("OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      await axios.post("/users/reset-password", { email, newPass });
      alert("Password reset successfully!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="form-container forgot-password">
      <h1>Reset Your Password</h1>
      {step === 1 && (
        <form onSubmit={handleRequestOTP}>
          {error && <p className="error">{error}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send OTP</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP}>
          {error && <p className="error">{error}</p>}
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          {error && <p className="error">{error}</p>}
          <input
            type="password"
            placeholder="Enter new password"
            name="newPass"
            value={newPass}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
      <div className="form-footer">
        <button onClick={() => navigate("/")}>Back to Login</button>
      </div>
    </div>
  );
}

export default ResetPass;
