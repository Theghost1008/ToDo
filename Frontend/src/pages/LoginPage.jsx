import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../api/axios.js";

function Login(){
    const [email, setEmail] = useState("")
    const [error, setError] = useState(null);
    const [password, setPass] = useState("")
    const navigate = useNavigate()

    const handleLogin = async(e)=>{
        e.preventDefault()
        try{
            const response = await axios.post("/users/login",{email,password},{withCredentials:true})
            if(response.status === 200)
                navigate("/notes")
        }catch(err){
            setError(err.response?.data?.message || "Invalid Login credentials");
        }
    }
    const handleRegister = async()=>{
        navigate("/register")
    }

    return (
    <div className="login-page">
        <div className="form-container login">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                {error && <p className="error">{error}</p>}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=>setPass(e.target.value)}
                        required
                    />
                    <br/>
                    <button type="submit">Submit</button>
            </form>
            <div className="form-footer">
                <button onClick={()=>navigate("/register-request")}>New to us? Register here</button>
                <button onClick={()=>navigate("/forgot-password")}>Forgot password?CLick here</button>
            </div>
        </div>
        <div className="welcome-text">
            <h2>WELCOME<br/>BACK!</h2>
            <p>Hope you are doing well,<br/>lets plan your day...</p>
        </div>
    </div>
    )
}

export default Login