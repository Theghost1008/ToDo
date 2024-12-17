import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedInfo =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken")
        if(!user)
        {
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user; //added user object to req with a random name say user and due to this now we have accesss to req.user in user.controller logout form
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})