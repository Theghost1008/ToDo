import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.js";

function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/users/verify-register", { otp });
            navigate("/register");
        } catch (err) {
            setError(err.response?.data?.message || "OTP verification failed");
        }
    };

    return (
        <div className="form-container verify-otp">
            <h1>Verify OTP</h1>
            <form onSubmit={handleVerifyOtp}>
                {error && <p className="error">{error}</p>}
                <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button type="submit">Verify</button>
            </form>
            <div className="form-footer">
                <button onClick={() => navigate("/")}>Back to Login</button>
            </div>
        </div>
    );
}

export default VerifyOtp;
