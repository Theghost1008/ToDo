import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"


const generateAccesssAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        console.log("Before saving: ", user);
        await user.save({validateBeforeSave : false})// when saving mongoose models kicks in i.e. when saving password is required
        console.log("After saving: ", user);
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler( async(req,res)=>{
    const {name,email,username, password} = req.body
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser)
        throw new ApiError(409, "User with entered username or email already exists")
    const user = await User.create({
        name,
        email,
        username: username.toLowerCase(),
        password,
    })
    const createdUser = await User.findById(user._id)
    if(!createdUser)
        {
            throw new ApiError(500, "Something went wrong while registering the user");
        }
        
    return res.status(201).json(
        new apiResponse(200,createdUser,"User registered successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    const {name, email, username, password} = req.body

    if(!(username || email))
    {
        throw new ApiError(400, "Username or email is required")
    }

    const foundUser = User.findOne({
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

export {registerUser, loginUser}