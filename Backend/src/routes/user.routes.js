import { Router } from "express";
import { loginUser, registerUser,logoutUser,requestOTP, verifyOTP, resetPass } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { sessionMiddleware } from "../middleware/session.middleware.js";

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/request-otp").post(sessionMiddleware,requestOTP)

router.route("/verify-otp").post(sessionMiddleware,verifyOTP)

router.route("/reset-password").post(sessionMiddleware,resetPass)

export default router