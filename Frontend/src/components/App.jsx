// import React, { useEffect, useState } from "react";
// import Header from "./Header";
// import Footer from "./Footer";
// import Note from "./Note";
// import CreateArea from "./CreateArea";


// function App() {
//   const [notes, setNotes] = useState([]);

//   function addNote(newNote) {
//     setNotes(prevNotes => {
//       return [...prevNotes, newNote];
//     });
//   }

//   function deleteNote(id) {
//     setNotes(prevNotes => {
//       return prevNotes.filter((noteItem, index) => {
//         return index !== id;
//       });
//     });
//   }

//   return (
//     <div>
//       <Header />
//       <CreateArea onAdd={addNote} />
//       {notes.map((noteItem, index) => {
//         return (
//           <Note
//             key={index}
//             id={index}
//             title={noteItem.title}
//             content={noteItem.content}
//             onDelete={deleteNote}
//           />
//         );
//       })}
//       <Footer />
//     </div>
//   );
// }

// export default App;

import React from "react";
import { Routes, Route } from "react-router-dom";
// import LoginForm from "../forms/LoginForm";
// import RegisterForm from "./forms/RegisterForm";
// import ForgotPasswordForm from "./forms/ForgotPasswordForm";
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
