// import React, { useState } from "react";
// import AddIcon from "@mui/icons-material/Add";
// import { Fab } from "@mui/material";
// import { Zoom } from "@mui/material";

// function CreateArea(props) {
//   const [isExpanded, setExpanded] = useState(false);

//   const [note, setNote] = useState({
//     title: "",
//     content: "",
//   });

//   function handleChange(event) {
//     const { name, value } = event.target;

//     setNote((prevNote) => {
//       return {
//         ...prevNote,
//         [name]: value,
//       };
//     });
//   }

//   async  function submitNote(event) {
//     event.preventDefault();
//     await props.onAdd(note);
//     setNote({
//       title: "",
//       content: "",
//     });
//   }

//   function expand() {
//     setExpanded(true);
//   }

//   return (
//     <div>
//       <form className="create-note">
//         {isExpanded && (
//           <input
//             name="title"
//             onChange={handleChange}
//             value={note.title}
//             placeholder="Title"
//           />
//         )}

//         <textarea
//           name="content"
//           onClick={expand}
//           onChange={handleChange}
//           value={note.content}
//           placeholder="Take a note..."
//           rows={isExpanded ? 3 : 1}
//         />
//         <Zoom in={isExpanded}>
//           <Fab onClick={submitNote}>
//             <AddIcon />
//           </Fab>
//         </Zoom>
//       </form>
//     </div>
//   );
// }

// export default CreateArea;


import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";

function CreateArea(props) {
  const [isExpanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [note, setNote] = useState({
    title: "",
    content: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  }

  async function submitNote(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await props.onAdd(note);
      setNote({
        title: "",
        content: "",
      });
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function expand() {
    setExpanded(true);
  }

  return (
    <div>
      <form className="create-note">
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
          />
        )}
        <textarea
          name="content"
          onClick={expand}
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
        />
        <Zoom in={isExpanded}>
          <Fab onClick={submitNote} disabled={isSubmitting}>
            <AddIcon />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
