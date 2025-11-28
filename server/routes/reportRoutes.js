import express from "express";
import authenticateUser from "../middleware/userAuth.js";
import { validate } from "../middleware/validate.js";
import { reportUpload, handleMulterError } from "../config/multer.js";
import {
  uploadReportSchema,
  updateReportSchema,
  getReportsQuerySchema,
} from "../validators/reportSchema.js";
import {
  uploadReport,
  getAllReports,
  getReportById,
  getReportsByMember,
  updateReport,
  deleteReport,
  searchReports,
  getReportStats,
  downloadReport,
} from "../controllers/reportController.js";

const reportRouter = express.Router();

// All routes require authentication
reportRouter.use(authenticateUser);

// Upload report - Validation AFTER multer
reportRouter.post(
  "/upload",
  reportUpload.single("reportFile"),
  handleMulterError, // Handle multer errors
  validate(uploadReportSchema),
  uploadReport
);

// Get all reports with filters
reportRouter.get("/all", validate(getReportsQuerySchema), getAllReports);

// Search reports
reportRouter.get("/search", searchReports);

// Get statistics
reportRouter.get("/stats", getReportStats);

// Get reports by family member
reportRouter.get("/member/:memberId", getReportsByMember);

// Get single report
reportRouter.get("/:id", getReportById);

// Update report metadata
reportRouter.put("/:id", validate(updateReportSchema), updateReport);

// Delete report
reportRouter.delete("/:id", deleteReport);

// Download report file
reportRouter.get("/:id/download", downloadReport);

export default reportRouter;
