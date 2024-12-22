import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "../pages/LoginPage";
import RegisterForm from "../pages/RegistrationPage";
import ResetPass from "../pages/ResetPass";
import Home from "../pages/Home";
import VerifyRegister from "../pages/VerifyRegister.jsx";
import RegisterPage from "../pages/Register.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/register-request" element={<RegisterForm />} />
      <Route path="/verify-register" element={<VerifyRegister/>}/>
      <Route path="/forgot-password" element={<ResetPass/>} />
      <Route path="/notes" element={<Home />} />
    </Routes>
  );
}

export default App;
