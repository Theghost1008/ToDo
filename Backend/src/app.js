import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import notesRoutes from "./routes/note.routes.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()
console.log(process.env.CORS_ORIGIN);

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))//accepting json, json in configured ; form is filled we got data
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/notes", notesRoutes)

export {app}