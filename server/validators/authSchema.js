import { z } from "zod";

// Strong Email Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strong Password Regex
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z
      .string()
      .email("Please enter a valid email")
      .regex(emailRegex, "Invalid email format"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain uppercase, lowercase, number & special character"
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please enter a valid email")
      .regex(emailRegex, "Invalid email format"),

    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^[0-9]{6}$/, "OTP must contain only digits"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
