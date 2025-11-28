import { z } from "zod";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100)
      .trim()
      .optional(),

    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone cannot exceed 15 digits")
      .optional()
      .or(z.literal("")),

    dateOfBirth: z.string().optional().or(z.literal("")),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    bloodGroup: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),
    address: z.string().max(200).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    zipCode: z.string().max(10).optional(),

    emergencyContact: z
      .object({
        name: z.string().max(100).optional(),
        relationship: z.string().max(50).optional(),
        phone: z.string().min(10).max(15).optional().or(z.literal("")),
      })
      .optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128)
      .regex(
        strongPasswordRegex,
        "Password must include uppercase, lowercase, number & special character"
      ),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
