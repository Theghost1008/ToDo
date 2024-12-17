import { Router } from "express";
import { createNote,  getAllNotes, deleteNote} from "../controllers/note.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/notes").post(verifyJWT,createNote)

router.route("/notes").get(verifyJWT,getAllNotes)

router.route(`/notes/:id`).delete(verifyJWT,deleteNote)