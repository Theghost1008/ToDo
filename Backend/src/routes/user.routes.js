import { Router } from "express";
import { registerRequest, verifyRegistrationOTP,loginUser, registerUser,logoutUser,requestOTP, verifyOTP, resetPass } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { sessionMiddleware } from "../middleware/session.middleware.js";

const router = Router()

router.route("/register-request").post(sessionMiddleware,registerRequest)

router.route("/verify-register").post(sessionMiddleware,verifyRegistrationOTP)

router.route("/register").post(sessionMiddleware,registerUser)

router.route("/login").post(sessionMiddleware,loginUser)

router.route("/logout").post(sessionMiddleware,verifyJWT,logoutUser)

router.route("/request-otp").post(sessionMiddleware,requestOTP)

router.route("/verify-otp").post(sessionMiddleware,verifyOTP)

router.route("/reset-password").post(sessionMiddleware,resetPass)

export default router