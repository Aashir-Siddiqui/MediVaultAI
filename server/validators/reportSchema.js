import { z } from "zod";

// Valid report types
const reportTypes = [
  "Blood Test",
  "X-Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound",
  "ECG",
  "EEG",
  "Urine Test",
  "Stool Test",
  "Thyroid Test",
  "Diabetes Test",
  "Liver Function Test",
  "Kidney Function Test",
  "Lipid Profile",
  "Complete Blood Count",
  "Biopsy",
  "Endoscopy",
  "Colonoscopy",
  "Mammography",
  "Bone Density Scan",
  "Pulmonary Function Test",
  "Other",
];

// Upload report validation - FIXED for multer
export const uploadReportSchema = z.object({
  body: z.object({
    familyMemberId: z.string().min(1, "Family member ID is required"),

    reportType: z.enum(reportTypes, {
      errorMap: () => ({ message: "Invalid report type" }),
    }),

    reportDate: z.string().min(1, "Report date is required"),

    hospitalName: z.string().max(200).optional().default(""),

    doctorName: z.string().max(100).optional().default(""),

    notes: z.string().max(1000).optional().default(""),

    // Tags can be string or array - multer sends as string
    tags: z.string().optional().default(""),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// Update report validation (all fields optional)
export const updateReportSchema = z.object({
  body: z.object({
    reportType: z.enum(reportTypes).optional(),
    reportDate: z.string().optional(),
    hospitalName: z.string().max(200).optional(),
    doctorName: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
    tags: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Report ID is required"),
  }),
  query: z.object({}).optional(),
});

// Query filters validation
export const getReportsQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      familyMemberId: z.string().optional(),
      reportType: z.enum(reportTypes).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z
        .enum(["Uploaded", "Processing", "Analyzed", "Failed"])
        .optional(),
      isAnalyzed: z.enum(["true", "false"]).optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.enum(["reportDate", "createdAt", "updatedAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

// Search query validation
export const searchReportsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    query: z.string().min(1, "Search query is required"),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
