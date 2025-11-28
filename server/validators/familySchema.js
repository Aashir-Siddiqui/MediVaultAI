import { z } from "zod";

const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const objectIdRegex = /^[a-f\d]{24}$/i;

// Add family member validation
export const addFamilyMemberSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),

    relation: z.enum(["Self", "Father", "Mother", "Spouse", "Child", "Other"], {
      errorMap: () => ({ message: "Invalid relation type" }),
    }),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((date) => {
        const dob = new Date(date);
        const today = new Date();
        return dob < today;
      }, "Date of birth must be in the past")
      .refine((date) => {
        const dob = new Date(date);
        const minDate = new Date("1900-01-01");
        return dob > minDate;
      }, "Invalid date of birth"),

    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Invalid gender" }),
    }),

    bloodGroup: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional()
      .or(z.literal("")),

    allergies: z
      .array(z.string().min(1, "Allergy cannot be empty"))
      .optional()
      .default([]),

    chronicConditions: z
      .array(z.string().min(1, "Condition cannot be empty"))
      .optional()
      .default([]),

    emergencyContact: z
      .string()
      .min(1, "Emergency contact is required")
      .regex(phoneRegex, "Invalid emergency contact number"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Update family member validation
export const updateFamilyMemberSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim()
      .optional(),

    relation: z
      .enum(["Self", "Father", "Mother", "Spouse", "Child", "Other"])
      .optional(),

    dateOfBirth: z
      .string()
      .refine((date) => {
        if (!date) return true;
        const dob = new Date(date);
        const today = new Date();
        return dob < today;
      }, "Date of birth must be in the past")
      .optional(),

    gender: z.enum(["Male", "Female", "Other"]).optional(),

    bloodGroup: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional()
      .or(z.literal("")),

    allergies: z.array(z.string().min(1, "Allergy cannot be empty")).optional(),

    chronicConditions: z
      .array(z.string().min(1, "Condition cannot be empty"))
      .optional(),

    emergencyContact: z
      .string()
      .regex(phoneRegex, "Invalid emergency contact number")
      .optional(),
  }),
  params: z.object({
    id: z
      .string()
      .min(1, "Family member ID is required")
      .regex(objectIdRegex, "Invalid MongoDB ObjectId format"),
  }),
  query: z.object({}).optional(),
});
