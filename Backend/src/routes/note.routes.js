import { Router } from "express";
import { createNote,  getAllNotes, deleteNote} from "../controllers/note.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { sessionMiddleware } from "../middleware/session.middleware.js";

const router = Router()

router.route("/").post(verifyJWT,createNote)

router.route("/").get(verifyJWT,getAllNotes)

router.route(`/:_id`).delete(verifyJWT,deleteNote)

export default router