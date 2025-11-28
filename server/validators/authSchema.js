import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Register validation
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(60, "Name cannot exceed 60 characters")
      .trim(),
    email: z
      .string()
      .email("Invalid email")
      .regex(emailRegex, "Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        strongPasswordRegex,
        "Password must include uppercase, lowercase, number & special character"
      ),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Login validation
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email")
      .regex(emailRegex, "Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password too long"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Verify OTP validation (for email verification)
export const verifyOtpSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Send Reset OTP validation
export const sendResetOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email")
      .regex(emailRegex, "Invalid email format")
      .toLowerCase()
      .trim(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Reset Password validation
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email")
      .regex(emailRegex, "Invalid email format")
      .toLowerCase()
      .trim(),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        strongPasswordRegex,
        "Password must include uppercase, lowercase, number & special character"
      ),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Optional: Verify Reset OTP validation (if you want separate endpoint)
export const verifyResetOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email")
      .regex(emailRegex, "Invalid email format")
      .toLowerCase()
      .trim(),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
