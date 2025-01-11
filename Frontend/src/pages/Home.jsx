import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import Note from "../components/Note.jsx"
import CreateArea from "../components/CreateArea.jsx"

function Home(){
    const [notes,setNotes] = useState([])

    useEffect(()=>{
        const fetchNotes = async ()=>{
            try {
                const response = await axios.get("/notes")
                setNotes(response.data.data)
            } catch (err) {
                console.error("Failed to fetch notes: ", err)
            }
        }
        fetchNotes();
    },[])

    const addNote = async(newNote) =>{
        try{
            const response = await axios.post("/notes", newNote)
            if (response.status === 201 && response.data.success) {
                setNotes((prevNotes) => [...prevNotes, response.data.data]);
            } else {
                console.error("Failed to add note: Unexpected response", response);
            }
        } catch (error) {
            console.error("Failed to add note: ", error)
        }
    }

    const deleteNote = async(id)=>{
        try{
            const response = await axios.delete(`/notes/${id}`)
            if(response.status === 200 && response.data.success){
                setNotes((prev)=>prev.filter((note)=>note._id != id))
            }
            else{
                console.error("Failed to delete note: Unexpected error", response)
            }
        } catch (err) {
            console.error("Failed to delete note: ", err)
        }
    }

    return <div className="heading">
        <Header/>
        <CreateArea onAdd ={addNote}/>
        {notes.map((note)=>(
            <Note
                key={note._id}
                id={note._id}
                title = {note.title}
                content = {note.content}
                onDelete = {deleteNote}
            />
        ))}
        <Footer/>
    </div>
}

export default Home