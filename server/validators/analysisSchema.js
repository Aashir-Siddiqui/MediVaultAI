import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

// Analyze report validation - FIXED to handle optional body
export const analyzeReportSchema = z.object({
  body: z
    .object({
      sendEmail: z.boolean().optional(),
    })
    .optional()
    .default({}),
  params: z.object({
    id: z
      .string()
      .min(1, "Report ID is required")
      .regex(objectIdRegex, "Invalid MongoDB ObjectId format"),
  }),
  query: z.object({}).optional(),
});

// Ask question validation
export const askQuestionSchema = z.object({
  body: z.object({
    question: z
      .string()
      .min(5, "Question must be at least 5 characters")
      .max(500, "Question cannot exceed 500 characters"),
  }),
  params: z.object({
    id: z
      .string()
      .min(1, "Report ID is required")
      .regex(objectIdRegex, "Invalid MongoDB ObjectId format"),
  }),
  query: z.object({}).optional(),
});

// Health summary validation - FIXED
export const healthSummarySchema = z.object({
  body: z
    .object({
      sendEmail: z.boolean().optional(),
    })
    .optional()
    .default({}),
  params: z.object({
    memberId: z
      .string()
      .min(1, "Member ID is required")
      .regex(objectIdRegex, "Invalid MongoDB ObjectId format"),
  }),
  query: z.object({}).optional(),
});
