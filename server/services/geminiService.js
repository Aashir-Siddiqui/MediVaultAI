// services/geminiService.js
import { getGeminiModel, getGeminiVisionModel } from "../config/gemini.js";
import fs from "fs";

// Create medical analysis prompt - OPTIMIZED
const createMedicalAnalysisPrompt = (extractedText, patientInfo) => {
  // Clean the extracted text
  const cleanText = extractedText
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 6000); // Reasonable limit

  return `You are a medical AI assistant. Analyze this medical report and return ONLY a valid JSON object.

PATIENT:
Name: ${patientInfo.name}
Age: ${patientInfo.age}
Gender: ${patientInfo.gender}
Blood Group: ${patientInfo.bloodGroup || "Not specified"}
Allergies: ${patientInfo.allergies?.join(", ") || "None"}
Chronic Conditions: ${patientInfo.chronicConditions?.join(", ") || "None"}

REPORT TEXT:
${cleanText}

Return analysis in this exact JSON structure with NO additional text:
{
  "summary": "Brief 2-3 sentence overview of the report findings",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "abnormalValues": [
    {
      "parameter": "Test name",
      "value": "Result value",
      "normalRange": "Normal range",
      "severity": "Normal"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "healthInsights": "Overall health insights in one paragraph",
  "nextSteps": ["Next step 1", "Next step 2"]
}

RULES:
- Return ONLY valid JSON
- NO markdown, NO code blocks, NO explanations
- Keep strings concise to avoid truncation
- Severity MUST be: "Normal", "Slightly Abnormal", "Abnormal", or "Critical"
- All arrays must have at least one item
- Use simple medical language
- Do NOT diagnose or prescribe
- Always recommend consulting healthcare professionals`;
};

// Robust JSON parser with fallback
const parseGeminiResponse = (responseText) => {
  try {
    // First, try direct parse (if responseMimeType worked)
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.summary) {
        return parsed;
      }
    } catch (e) {
      // Continue to cleaning if direct parse fails
    }

    // Clean the response
    let cleanedText = responseText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    // Extract JSON object
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No valid JSON object found in response");
    }

    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);

    // Try to fix common JSON errors
    cleanedText = cleanedText
      .replace(/,\s*}/g, "}") // Remove trailing commas
      .replace(/,\s*]/g, "]");

    // Parse
    const parsed = JSON.parse(cleanedText);

    // Validate required fields
    if (!parsed.summary) {
      throw new Error("Missing summary field");
    }

    return parsed;
  } catch (error) {
    console.error("JSON Parse Error:");
    console.error("Error:", error.message);
    console.error("Response:", responseText.substring(0, 500));

    // Return fallback structure
    return {
      summary:
        "Analysis completed but response formatting failed. Please consult your healthcare provider for detailed interpretation.",
      keyFindings: ["Report analysis encountered formatting issues"],
      abnormalValues: [],
      recommendations: [
        "Please consult your healthcare provider for detailed analysis",
      ],
      healthInsights:
        "Unable to parse complete analysis. Recommend professional medical review.",
      nextSteps: [
        "Schedule an appointment with your doctor",
        "Bring this report for professional review",
      ],
    };
  }
};

// Analyze medical report with Gemini
export const analyzeReportWithGemini = async (
  extractedText,
  patientInfo,
  reportType
) => {
  try {
    if (!extractedText || extractedText.length < 50) {
      throw new Error("Insufficient text extracted from report for analysis");
    }

    console.log("Starting Gemini analysis for report type:", reportType);
    console.log("Extracted text length:", extractedText.length);

    const model = getGeminiModel();
    const prompt = createMedicalAnalysisPrompt(extractedText, patientInfo);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log("Gemini analysis completed");
    console.log("Response length:", analysisText.length);
    console.log("Response preview:", analysisText.substring(0, 200));

    // Parse with robust error handling
    const analysis = parseGeminiResponse(analysisText);

    // Validate and structure the response
    const structuredAnalysis = {
      summary: analysis.summary || "Analysis completed successfully",
      keyFindings:
        Array.isArray(analysis.keyFindings) && analysis.keyFindings.length > 0
          ? analysis.keyFindings
          : ["No specific findings identified"],
      abnormalValues: Array.isArray(analysis.abnormalValues)
        ? analysis.abnormalValues.map((val) => ({
            parameter: val.parameter || "Unknown",
            value: val.value || "N/A",
            normalRange: val.normalRange || "N/A",
            severity: [
              "Normal",
              "Slightly Abnormal",
              "Abnormal",
              "Critical",
            ].includes(val.severity)
              ? val.severity
              : "Normal",
          }))
        : [],
      recommendations:
        Array.isArray(analysis.recommendations) &&
        analysis.recommendations.length > 0
          ? analysis.recommendations
          : ["Consult with your healthcare provider"],
      healthInsights:
        analysis.healthInsights || "Please review with your doctor",
      nextSteps:
        Array.isArray(analysis.nextSteps) && analysis.nextSteps.length > 0
          ? analysis.nextSteps
          : ["Schedule a follow-up with your doctor"],
      analyzedAt: new Date(),
      isAnalyzed: true,
    };

    console.log("✅ Analysis structured successfully");

    return structuredAnalysis;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

// Analyze image directly with Gemini Vision
export const analyzeImageWithGeminiVision = async (imagePath, patientInfo) => {
  try {
    console.log("Starting Gemini Vision analysis");

    const model = getGeminiVisionModel();

    // Read image file
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const prompt = `Analyze this medical report image for patient: ${patientInfo.name}, Age: ${patientInfo.age}, Gender: ${patientInfo.gender}

Return ONLY valid JSON with this structure:
{
  "extractedText": "All visible text from the image",
  "summary": "Brief summary of findings",
  "keyFindings": ["Finding 1", "Finding 2"],
  "abnormalValues": [{"parameter": "Name", "value": "Value", "normalRange": "Range", "severity": "Normal"}],
  "recommendations": ["Recommendation 1"],
  "healthInsights": "Health insights paragraph",
  "nextSteps": ["Next step 1"]
}

Keep responses concise. NO markdown blocks.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const analysisText = response.text();

    console.log("Gemini Vision analysis completed");

    const analysis = parseGeminiResponse(analysisText);

    return {
      extractedText: analysis.extractedText || "",
      analysis: {
        summary: analysis.summary || "",
        keyFindings: analysis.keyFindings || [],
        abnormalValues: analysis.abnormalValues || [],
        recommendations: analysis.recommendations || [],
        healthInsights: analysis.healthInsights || "",
        nextSteps: analysis.nextSteps || [],
        analyzedAt: new Date(),
        isAnalyzed: true,
      },
    };
  } catch (error) {
    console.error("Gemini Vision analysis error:", error);
    throw new Error(`Vision AI analysis failed: ${error.message}`);
  }
};

// Generate health summary for multiple reports
export const generateHealthSummary = async (reports, patientInfo) => {
  try {
    console.log("Generating health summary for", reports.length, "reports");

    const model = getGeminiModel();

    const reportsText = reports
      .map((report, index) => {
        return `REPORT ${index + 1}: ${report.reportType} (${new Date(
          report.reportDate
        ).toLocaleDateString()}) - ${
          report.aiAnalysis?.summary || "Not analyzed"
        }`;
      })
      .join("\n");

    const prompt = `Create a comprehensive health summary for this patient.

PATIENT: ${patientInfo.name}, Age: ${patientInfo.age}, Gender: ${
      patientInfo.gender
    }
Blood Group: ${patientInfo.bloodGroup || "Not specified"}
Allergies: ${patientInfo.allergies?.join(", ") || "None"}
Chronic Conditions: ${patientInfo.chronicConditions?.join(", ") || "None"}

REPORTS ANALYZED:
${reportsText}

Provide a comprehensive health summary including:
1. Overall health status
2. Trends observed across reports
3. Areas of concern
4. Positive developments
5. General recommendations

Keep it clear, concise, and patient-friendly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log("Health summary generated successfully");

    return summary;
  } catch (error) {
    console.error("Health summary generation error:", error);
    throw new Error(`Failed to generate health summary: ${error.message}`);
  }
};

// Ask follow-up question about a report
export const askQuestionAboutReport = async (
  question,
  reportAnalysis,
  patientInfo
) => {
  try {
    console.log("Processing question about report");

    const model = getGeminiModel();

    const prompt = `You are helping a patient understand their medical report.

PATIENT: ${patientInfo.name}, ${patientInfo.age} years old, ${
      patientInfo.gender
    }

REPORT SUMMARY: ${reportAnalysis.summary}
KEY FINDINGS: ${reportAnalysis.keyFindings?.join(", ")}

PATIENT QUESTION: ${question}

Provide a clear, empathetic answer in simple language. Always recommend consulting healthcare professionals for medical advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    console.log("Question answered successfully");

    return answer;
  } catch (error) {
    console.error("Question answering error:", error);
    throw new Error(`Failed to answer question: ${error.message}`);
  }
};
