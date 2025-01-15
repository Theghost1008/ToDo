import { Router } from "express";
import { createNote,  getAllNotes, deleteNote} from "../controllers/note.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { sessionMiddleware } from "../middleware/session.middleware.js";

const router = Router()

router.route("/").post(sessionMiddleware,verifyJWT,createNote)

router.route("/").get(sessionMiddleware,verifyJWT,getAllNotes)

router.route(`/:_id`).delete(sessionMiddleware,verifyJWT,deleteNote)

export default router