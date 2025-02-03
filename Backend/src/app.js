import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import notesRoutes from "./routes/note.routes.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5174",
    credentials: true
}))

app.use(express.json({limit: "16kb"}))//accepting json, json in configured ; form is filled we got data
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.set('trust proxy', 1); 

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/notes", notesRoutes)

export {app}