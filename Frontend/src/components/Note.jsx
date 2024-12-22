import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

function Note(props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = async () => {
    setIsDeleting(true);
    try {
      await props.onDelete(props.id);
    } catch (err) {
      console.error("Error deleting note:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      <button onClick={handleClick} disabled={isDeleting}>
        <DeleteIcon />
      </button>
    </div>
  );
}

export default Note;

