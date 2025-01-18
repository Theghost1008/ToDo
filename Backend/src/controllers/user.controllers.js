import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import dotenv from "dotenv"
import crypto from "crypto"
import nodemailer from "nodemailer"

dotenv.config();

const generateOTP = ()=>{
    return crypto.randomInt(100000, 999999).toString();
}
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    debug:true,
    logger:true
})


const sendOTP = async (email, otp, msg, ob)=>{
    const mailOptions={
        from: process.env.EMAIL,
        to: email,
        subject: `${ob}`,
        text: `${msg} ${otp}`
    }
    try {
        await transporter.sendMail(mailOptions)
        
    } catch (error) {
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
        // throw new ApiError(400, "All fields are required");
        return res.status(400).json({message: "All fields are required"})
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        return res.status(400).json({message: "The entered username of email already exists"})
    }

    const otp = generateOTP();
    const otpExp = Date.now() + 10 * 60 * 1000;

    req.session.registrationData = { name, email, username, password, otp, otpExp };
    req.session.save((err)=>{
        if(err)
            console.error("Error in saving data: ", err)
        else
            console.log("Session saved yayy");
    })
    console.log("Session data: ", req.session.registrationData)

    try {
        await sendOTP(email, otp,"Your OTP for registration verification is: ", "Registration OTP");
        return res.status(200).json(new apiResponse(200, {}, "OTP sent to your email"));
    } catch (error) {
        throw new ApiError(500, "Failed to send OTP");
    }
});

const verifyRegistrationOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const { registrationData } = req.session;

    console.log('Session Data:', registrationData); 
    console.log('Received OTP:', otp);

    if (!registrationData) {
        console.error("No OTP session found")
        throw new ApiError(400, "No OTP session found");
    }

    const { otp: sessionOtp, otpExp } = registrationData;

    if (otp !== sessionOtp) {
        console.error("Invalid OTP: ",{received: otp, expected: sessionOtp})
        throw new ApiError(401, "Invalid OTP");
    }

    if (Date.now() > otpExp) {
        console.error("OTP time expired")
        throw new ApiError(401, "OTP expired");
    }
    req.session.registrationData.otpVerified = true
    req.session.save()
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
    const options ={
        httpOnly : true,
        secure: true,
        sameSite: "None"
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
        secure: true,
        sameSite:"None"
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
        await sendOTP(targetEmail,otp,"Your OTP for resetting password is as give below. Never share it to anyone!!","Reset password OTP")
    } catch (error) {
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
        throw new ApiError(401,"New password is required")
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