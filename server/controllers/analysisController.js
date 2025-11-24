// controllers/analysisController.js - FIXED
import MedicalReport from "../models/MedicalReport.js";
import FamilyMember from "../models/FamilyMembers.js";
import User from "../models/User.js";
import {
  extractTextFromFile,
  cleanExtractedText,
} from "../services/ocrService.js";
import {
  analyzeReportWithGemini,
  generateHealthSummary,
  askQuestionAboutReport,
} from "../services/geminiService.js";
import {
  sendAnalysisEmail,
  sendHealthSummaryEmail,
} from "../services/emailService.js";
import { generateAnalysisPDF } from "../services/pdfService.js";

// Analyze a specific report - FIXED
export const analyzeReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    // FIXED: Handle undefined body
    const sendEmail = req.body?.sendEmail || false;

    console.log("🔍 Starting analysis for report:", id);

    // Get report with family member
    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if already analyzed
    if (report.aiAnalysis?.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message:
          "Report is already analyzed. Use regenerate endpoint to re-analyze.",
      });
    }

    // Update status to processing
    report.status = "Processing";
    await report.save();

    try {
      let extractedText = report.extractedText;

      // STEP 1: Extract text if needed
      if (!extractedText || extractedText.length < 50) {
        console.log("📄 Extracting text from file...");

        try {
          extractedText = await extractTextFromFile(
            report.reportFile.url,
            report.reportFile.mimeType,
            report.reportFile.publicId
          );

          extractedText = cleanExtractedText(extractedText);

          // Save extracted text immediately
          report.extractedText = extractedText;
          await report.save();

          console.log("✅ Text extracted and saved");
        } catch (extractError) {
          console.error("❌ Text extraction failed:", extractError);
          report.status = "Failed";
          await report.save();

          return res.status(500).json({
            success: false,
            message: `Failed to extract text: ${extractError.message}`,
          });
        }
      } else {
        console.log("✅ Using existing extracted text");
      }

      // Validate extracted text
      if (!extractedText || extractedText.length < 50) {
        throw new Error("Insufficient text extracted from report");
      }

      // STEP 2: Prepare patient info
      const familyMember = report.familyMemberId;
      const patientInfo = {
        name: familyMember.name,
        age: familyMember.age || calculateAge(familyMember.dateOfBirth),
        gender: familyMember.gender,
        bloodGroup: familyMember.bloodGroup,
        allergies: familyMember.allergies || [],
        chronicConditions: familyMember.chronicConditions || [],
      };

      console.log("👤 Patient info prepared:", patientInfo.name);

      // STEP 3: Analyze with Gemini AI
      console.log("🤖 Starting AI analysis...");
      const analysis = await analyzeReportWithGemini(
        extractedText,
        patientInfo,
        report.reportType
      );

      console.log("✅ AI analysis completed");

      // STEP 4: Update report with analysis
      report.aiAnalysis = analysis;
      report.status = "Analyzed";
      await report.save();

      // STEP 5: Send email if requested
      if (sendEmail) {
        try {
          console.log("📧 Sending email...");
          const user = await User.findById(userId);

          const analysisData = {
            patientName: familyMember.name,
            age: patientInfo.age,
            gender: familyMember.gender,
            bloodGroup: familyMember.bloodGroup,
            reportType: report.reportType,
            reportDate: report.reportDate,
            hospitalName: report.hospitalName,
            doctorName: report.doctorName,
            summary: analysis.summary,
            keyFindings: analysis.keyFindings,
            abnormalValues: analysis.abnormalValues,
            recommendations: analysis.recommendations,
            healthInsights: analysis.healthInsights,
            nextSteps: analysis.nextSteps,
            allergies: familyMember.allergies,
            chronicConditions: familyMember.chronicConditions,
          };

          await sendAnalysisEmail(user.email, user.name, analysisData);
          console.log("✅ Email sent successfully");
        } catch (emailError) {
          console.error("⚠️ Email sending failed:", emailError);
          // Don't fail the analysis if email fails
        }
      }

      console.log("🎉 Analysis completed successfully");

      return res.status(200).json({
        success: true,
        message: "Report analyzed successfully",
        report: {
          _id: report._id,
          reportType: report.reportType,
          status: report.status,
          extractedText: report.extractedText.substring(0, 500) + "...",
          aiAnalysis: report.aiAnalysis,
        },
      });
    } catch (analysisError) {
      console.error("❌ Analysis error:", analysisError);

      // Update status to failed
      report.status = "Failed";
      await report.save();

      throw analysisError;
    }
  } catch (error) {
    console.error("❌ Analyze report error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze report",
    });
  }
};

// Regenerate analysis for a report
export const regenerateAnalysis = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (!report.extractedText || report.extractedText.length < 50) {
      return res.status(400).json({
        success: false,
        message: "No extracted text available. Please re-upload the report.",
      });
    }

    // Update status
    report.status = "Processing";
    await report.save();

    try {
      const familyMember = report.familyMemberId;
      const patientInfo = {
        name: familyMember.name,
        age: familyMember.age || calculateAge(familyMember.dateOfBirth),
        gender: familyMember.gender,
        bloodGroup: familyMember.bloodGroup,
        allergies: familyMember.allergies,
        chronicConditions: familyMember.chronicConditions,
      };

      const analysis = await analyzeReportWithGemini(
        report.extractedText,
        patientInfo,
        report.reportType
      );

      report.aiAnalysis = analysis;
      report.status = "Analyzed";
      await report.save();

      return res.status(200).json({
        success: true,
        message: "Analysis regenerated successfully",
        report,
      });
    } catch (analysisError) {
      report.status = "Failed";
      await report.save();
      throw analysisError;
    }
  } catch (error) {
    console.error("Regenerate analysis error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to regenerate analysis",
    });
  }
};

// Get analysis details
export const getAnalysis = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId",
      "name relation gender age bloodGroup allergies chronicConditions"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (!report.aiAnalysis?.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message: "Report has not been analyzed yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Analysis retrieved successfully",
      analysis: {
        report: {
          id: report._id,
          type: report.reportType,
          date: report.reportDate,
          hospital: report.hospitalName,
          doctor: report.doctorName,
          patient: {
            name: report.familyMemberId.name,
            relation: report.familyMemberId.relation,
            age: report.familyMemberId.age,
            gender: report.familyMemberId.gender,
          },
        },
        aiAnalysis: report.aiAnalysis,
        extractedText: report.extractedText,
      },
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Download analysis as PDF
export const downloadAnalysisPDF = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (!report.aiAnalysis?.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message: "Report has not been analyzed yet",
      });
    }

    const familyMember = report.familyMemberId;

    const analysisData = {
      patientName: familyMember.name,
      age: familyMember.age || calculateAge(familyMember.dateOfBirth),
      gender: familyMember.gender,
      bloodGroup: familyMember.bloodGroup,
      reportType: report.reportType,
      reportDate: report.reportDate,
      hospitalName: report.hospitalName,
      doctorName: report.doctorName,
      summary: report.aiAnalysis.summary,
      keyFindings: report.aiAnalysis.keyFindings,
      abnormalValues: report.aiAnalysis.abnormalValues,
      recommendations: report.aiAnalysis.recommendations,
      healthInsights: report.aiAnalysis.healthInsights,
      nextSteps: report.aiAnalysis.nextSteps,
      allergies: familyMember.allergies,
      chronicConditions: familyMember.chronicConditions,
    };

    const pdfBuffer = await generateAnalysisPDF(analysisData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=analysis-${report.reportType.replace(
        /\s+/g,
        "-"
      )}-${Date.now()}.pdf`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Download PDF error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
};

// Generate health summary for a family member
export const generateMemberHealthSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { memberId } = req.params;
    const sendEmail = req.body?.sendEmail || false;

    const familyMember = await FamilyMember.findOne({
      _id: memberId,
      userId,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    const reports = await MedicalReport.find({
      userId,
      familyMemberId: memberId,
      "aiAnalysis.isAnalyzed": true,
    }).sort({ reportDate: -1 });

    if (reports.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No analyzed reports found for this family member",
      });
    }

    const patientInfo = {
      name: familyMember.name,
      age: familyMember.age || calculateAge(familyMember.dateOfBirth),
      gender: familyMember.gender,
      bloodGroup: familyMember.bloodGroup,
      allergies: familyMember.allergies,
      chronicConditions: familyMember.chronicConditions,
    };

    const summary = await generateHealthSummary(reports, patientInfo);

    if (sendEmail) {
      try {
        const user = await User.findById(userId);
        const summaryData = {
          reportCount: reports.length,
          summary: summary,
          dateRange: {
            oldest: reports[reports.length - 1].reportDate,
            latest: reports[0].reportDate,
          },
        };
        await sendHealthSummaryEmail(user.email, user.name, summaryData);
      } catch (emailError) {
        console.error("Email failed:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Health summary generated successfully",
      summary: {
        patientName: familyMember.name,
        reportsAnalyzed: reports.length,
        dateRange: {
          from: reports[reports.length - 1].reportDate,
          to: reports[0].reportDate,
        },
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Generate health summary error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate health summary",
    });
  }
};

// Ask question about a report
export const askReportQuestion = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (!report.aiAnalysis?.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message: "Report must be analyzed first",
      });
    }

    const familyMember = report.familyMemberId;
    const patientInfo = {
      name: familyMember.name,
      age: familyMember.age || calculateAge(familyMember.dateOfBirth),
      gender: familyMember.gender,
    };

    const answer = await askQuestionAboutReport(
      question,
      report.aiAnalysis,
      patientInfo
    );

    return res.status(200).json({
      success: true,
      message: "Question answered successfully",
      question: question,
      answer: answer,
    });
  } catch (error) {
    console.error("Ask question error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to answer question",
    });
  }
};

export const sendAnalysisEmailController = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    console.log("📧 Sending analysis email for report:", id);

    // Get report with family member
    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if analyzed
    if (!report.aiAnalysis?.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message: "Report must be analyzed before sending email",
      });
    }

    // Get user email
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare analysis data for email
    const familyMember = report.familyMemberId;
    const analysisData = {
      patientName: familyMember.name,
      age: familyMember.age || calculateAge(familyMember.dateOfBirth),
      gender: familyMember.gender,
      bloodGroup: familyMember.bloodGroup,
      reportType: report.reportType,
      reportDate: report.reportDate,
      hospitalName: report.hospitalName,
      doctorName: report.doctorName,
      summary: report.aiAnalysis.summary,
      keyFindings: report.aiAnalysis.keyFindings,
      abnormalValues: report.aiAnalysis.abnormalValues,
      recommendations: report.aiAnalysis.recommendations,
      healthInsights: report.aiAnalysis.healthInsights,
      nextSteps: report.aiAnalysis.nextSteps,
      allergies: familyMember.allergies,
      chronicConditions: familyMember.chronicConditions,
    };

    // Send email with PDF attachment
    await sendAnalysisEmail(user.email, user.name, analysisData);

    console.log("✅ Email sent successfully to:", user.email);

    return res.status(200).json({
      success: true,
      message: "Analysis sent to your email successfully",
    });
  } catch (error) {
    console.error("❌ Send email error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
};

// Helper function to calculate age
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
