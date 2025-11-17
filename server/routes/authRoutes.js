// routes/authRoutes.js
import express from "express";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "../validators/authSchema.js";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  isAuthenticated,
} from "../controllers/authController.js";
import authenticateUser from "../middleware/userAuth.js";
import {
  loginLimiter,
  registerLimiter,
  verifyOtpLimiter,
  resetOtpLimiter,
  resetPasswordLimiter,
} from "../middleware/rateLimiters.js";

const authRouter = express.Router();

// Public routes with rate limiting
authRouter.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  register
);

authRouter.post("/login", loginLimiter, validate(loginSchema), login);

authRouter.post("/logout", logout);

// Protected routes (require authentication)
authRouter.post(
  "/send-verify-otp",
  authenticateUser,
  verifyOtpLimiter,
  sendVerifyOtp
);

authRouter.post(
  "/verify-account",
  authenticateUser,
  validate(verifyOtpSchema),
  verifyEmail
);

authRouter.post("/is-auth", authenticateUser, isAuthenticated);

// Password reset routes (public but rate limited)
authRouter.post(
  "/send-reset-otp",
  resetOtpLimiter,
  validate(sendResetOtpSchema),
  sendResetOtp
);

authRouter.post(
  "/verify-reset-otp",
  resetOtpLimiter,
  validate(verifyResetOtpSchema),
  verifyResetOtp
);

authRouter.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

export default authRouter;
