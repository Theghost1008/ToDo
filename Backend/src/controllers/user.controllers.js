import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import dotenv from "dotenv"
import crypto from "crypto"
import nodemailer from "nodemailer"
// import session from "express-session";
// import connectMongo from "connect-mongo";
// import express from "express";

dotenv.config();

// const MongoStore = connectMongo(session);

// const app = express();

// app.use(session({
//     secret: process.env.SESSION_SECRET || 'default_secret',
//     resave: false,
//     saveUninitialized: true,
//     store: connectMongo.create({ 
//         mongoUrl: `${process.env.MONGODB_URL}/ToDo?retryWrites=true&w=majority`, 
//         collectionName: 'sessions',
//         ttl: 60 * 60 
//     }),
//     cookie: {
//         maxAge: 1000 * 60 * 60,
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "development"
//     }
// }));


const generateOTP = ()=>{
    return crypto.randomInt(100000, 999999).toString();
}

console.log(process.env.EMAIL);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    debug:true,
    logger:true
})


const sendOTP = async (email, otp)=>{
    console.log(email,otp);
    const mailOptions={
        from: process.env.EMAIL,
        to: email,
        subject: "Reset password OTP",
        text: `Your OTP for reset password is ${otp}`
    }
    try {
        await transporter.sendMail(mailOptions)
        console.log("OTP sent successfully to: ", email);
        
    } catch (error) {
        console.log(error.message);
        throw new ApiError(500, "Failed to send OTP");
    }
    
}

const generateAccesssAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})// when saving mongoose models kicks in i.e. when saving password is required
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerRequest = asyncHandler(async (req, res) => {
    const { name, email, username, password } = req.body;

    if (!(name && email && username && password)) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with entered username or email already exists");
    }

    const otp = generateOTP();
    const otpExp = Date.now() + 10 * 60 * 1000;

    req.session.registrationData = { name, email, username, password, otp, otpExp };

    try {
        await sendOTP(email, otp);
        return res.status(200).json(new apiResponse(200, {}, "OTP sent to your email"));
    } catch (error) {
        throw new ApiError(500, "Failed to send OTP");
    }
});

const verifyRegistrationOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const { registrationData } = req.session;

    if (!registrationData) {
        throw new ApiError(400, "No OTP session found");
    }

    const { otp: sessionOtp, otpExp } = registrationData;

    if (otp !== sessionOtp) {
        throw new ApiError(401, "Invalid OTP");
    }

    if (Date.now() > otpExp) {
        throw new ApiError(401, "OTP expired");
    }
    req.session.registrationData.otpVerified = true
    return res.status(200).json(new apiResponse(200, {}, "OTP verified successfully"))
});

const registerUser = asyncHandler(async (req, res) => {
    const { registrationData } = req.session;

    if (!registrationData) {
        throw new ApiError(400, "No registration session found");
    }

    const { name, email, username, password, otpVerified } = registrationData;

    if (!otpVerified) {
        throw new ApiError(400, "OTP not verified");
    }

    const user = await User.create({
        name,
        email,
        username: username.toLowerCase(),
        password,
    })

    req.session.registrationData = null; // Clear the session after successful registration

    return res.status(201).json(new apiResponse(200, user, "User registered successfully"));
})

const loginUser = asyncHandler(async(req,res)=>{
    const {name, email, username, password} = req.body

    if(!(username || email))
    {
        throw new ApiError(400, "Username or email is required")
    }

    const foundUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(!foundUser)
        throw new ApiError(404, "User not found")

    const passCorrect = await foundUser.isPasswordCorrect(password)
    if(!passCorrect)
        throw new ApiError(401,"Invalid login credentials")


    const {accessToken,refreshToken} = await generateAccesssAndRefreshTokens(foundUser._id)
    const loggedInUser = await User.findById(foundUser._id).select("-password -refreshToken")
    console.log("Logged in user: ", loggedInUser);
    
    const options ={
        httpOnly : true,
        secure: true,
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {
            foundUser: loggedInUser, accessToken, refreshToken
        },"User logged in successfully")
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options={
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new apiResponse(200,{user: req.user},"User logged out"))
})

const requestOTP = asyncHandler (async(req,res)=>{
    const {email, username} = req.body
    if(!(email || username))
        throw new ApiError(400, "Email or username is required")
    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user)
        throw new ApiError(404, "User not found")

    const otp = generateOTP()
    const otpExp = Date.now() +10*60*1000

    user.otp = otp
    user.otpExp = otpExp
    await user.save()
    const targetEmail = email || user.email;
    try {
        await sendOTP(targetEmail,otp)
    } catch (error) {
        console.log("Error in sending otp: ", error)
        throw new ApiError(400, "Error in sending otp")
    }
    req.session.email = targetEmail;
    req.session.username = user.username;
    return res.status(200).json(new apiResponse(200,{},`OTP sent to your email: ${email}`))
})

const verifyOTP = asyncHandler(async(req,res)=>{
    const {otp} = req.body
    const {email,username} = req.session
    if(!(email || username || otp))
        throw new ApiError(401,"Email, username and otp are required")
    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user)
        throw new ApiError(404,"User not found")
    user.otp = undefined
    user.otpExp = undefined
    await user.save()
    return res.status(200).json(new apiResponse(200,{},"OTP verified successfully"))
})

const resetPass = asyncHandler (async(req,res)=>{
    const {newPass} = req.body
    const {email,username} = req.session
    if(!(email || username || newPass))
        throw new ApiError(401,"Username, email and new password are required")
    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user)
        throw new ApiError(404,"User not found")
    user.password = newPass
    await user.save()
    return res.status(200).json(new apiResponse(200,{},"Password resetted successfully"))
})

export {verifyRegistrationOTP, registerRequest,registerUser, loginUser, logoutUser, requestOTP, verifyOTP, resetPass}