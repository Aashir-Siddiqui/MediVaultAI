// routes/analysisRoutes.js
import express from "express";
import authenticateUser from "../middleware/userAuth.js";
import { validate } from "../middleware/validate.js";
import {
  analyzeReportSchema,
  askQuestionSchema,
  healthSummarySchema,
} from "../validators/analysisSchema.js";
import {
  analyzeReport,
  regenerateAnalysis,
  getAnalysis,
  downloadAnalysisPDF,
  generateMemberHealthSummary,
  askReportQuestion,
} from "../controllers/analysisController.js";

const analysisRouter = express.Router();

// All routes require authentication
analysisRouter.use(authenticateUser);

// Analyze a specific report
analysisRouter.post(
  "/analyze/:id",
  validate(analyzeReportSchema),
  analyzeReport
);

// Regenerate analysis
analysisRouter.post("/regenerate/:id", regenerateAnalysis);

// Get analysis details
analysisRouter.get("/:id", getAnalysis);

// Download analysis as PDF
analysisRouter.get("/:id/pdf", downloadAnalysisPDF);

// Generate health summary for a family member
analysisRouter.post(
  "/summary/:memberId",
  validate(healthSummarySchema),
  generateMemberHealthSummary
);

// Ask question about a report
analysisRouter.post(
  "/:id/question",
  validate(askQuestionSchema),
  askReportQuestion
);

export default analysisRouter;
