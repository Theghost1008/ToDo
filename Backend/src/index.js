import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js"

dotenv.config();

const port=process.env.PORT || 5000

connectDB()
.then(()=>{
    app.on("Error",(err)=>{
        console.log("Error: ", err)
        throw err
    })
    app.listen(port,()=>{
        console.log(`Server is running at port:${port}`)
    })
}).catch((err)=>{
    console.log("MongoDB connection failed", err)
})