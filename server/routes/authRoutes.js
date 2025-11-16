import express from "express";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
} from "../validators/authSchema.js";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/authController.js";
import authenticateUser from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/send-verify-otp", authenticateUser, sendVerifyOtp);
authRouter.post(
  "/verify-account",
  authenticateUser,
  validate(verifyOtpSchema),
  verifyEmail
);
authRouter.post("/logout", logout);

export default authRouter;
