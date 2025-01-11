import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.js";

function RegisterForm(){
    const [formdata, setData] = useState({
        name: "",
        email: "",
        username: "",
        password:"",
    })
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async(e)=>{
        e.preventDefault();
        console.log("Form data: ", formdata)
        try {
            await axios.post("/users/register-request", formdata)
            navigate("/verify-register")
        } catch (err) {
            if(err.response?.status===400)
                setError(err.response?.data?.message)
            else
                setError("Registration failed, Please try again");
        }
    }
    const handleChange = async(e)=>{
        const {name,value} = e.target
        setData((prev)=>({...prev,[name]:value}))
    }

    return(
    <div className="form-container register">
        <h1>Create Your Account</h1>
        <form onSubmit={handleRegister}>
            {error && <p className="error">{error}</p>}
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={formdata.name}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="email"
                placeholder="Email"
                value={formdata.email}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="username"
                placeholder="Userame"
                value={formdata.username}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formdata.password}
                onChange={handleChange}
                required
            />
            <button type="submit">Register</button>
        </form>
        <div className="form-footer">
            <button onClick={() => navigate("/")}>Back to Login</button>
      </div>
    </div>)
   
}

export default RegisterForm