import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { type } from "os";

const userSchema = new Schema(
    {
        name:{
            type: String,
        },
        email:{
            type: String,
        },
        username:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken:{
            type: String
        },
        otp:{
            type: String
        },
        otpExp:{
            type: Date
        },
        isVerified:{
            type: Boolean,
            default: false
        }
    },{timestamps: true})


userSchema.pre("save", async function(next){
    if(!this.isModified("password"))
        return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})   

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this.id,
            email: this.email,
            username : this.username,
            //password : this.password,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', userSchema);