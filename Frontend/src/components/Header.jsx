import React from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import {useNavigate} from "react-router-dom"
import axios from "../api/axios.js"

function Header() {

  const navigate = useNavigate();
  const handleLogout = async()=>{
    try{
      await axios.post("/users/logout");
      navigate("/")
    }catch(err){
      console.log("Logout failed: ", err.response?.data?.message || err.message)
      alert("Logout failed")
    }
  }
  return (
    <header>
      <h1>
        <HighlightIcon />
        ToDo
      </h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default Header;
