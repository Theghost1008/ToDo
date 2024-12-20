import { Note } from "../models/note.models.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        throw new ApiError(400, 'Title and content are required');
    }

    const note = await Note.create({
        title,
        content,
        user: req.user._id, // Assuming authentication middleware adds user info
    });

    res.status(201).json({ success: true, data: note });
});

// Get all notes
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user._id });

    res.status(200).json({ success: true, data: notes });
});

// Delete a note
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
        throw new ApiError(404, 'Note not found');
    }

    res.status(200).json({ success: true, message: 'Note deleted successfully' });
});

export { createNote, getAllNotes, deleteNote};
