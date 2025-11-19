// services/geminiService.js
import { getGeminiModel, getGeminiVisionModel } from "../config/gemini.js";
import fs from "fs";

// Create medical analysis prompt
const createMedicalAnalysisPrompt = (extractedText, patientInfo) => {
  return `You are an expert medical AI assistant. Analyze the following medical report and provide a comprehensive analysis.

PATIENT INFORMATION:
- Name: ${patientInfo.name}
- Age: ${patientInfo.age}
- Gender: ${patientInfo.gender}
- Blood Group: ${patientInfo.bloodGroup || "Not specified"}
- Known Allergies: ${patientInfo.allergies?.join(", ") || "None"}
- Chronic Conditions: ${patientInfo.chronicConditions?.join(", ") || "None"}

MEDICAL REPORT TEXT:
${extractedText}

Please provide a detailed analysis in the following JSON format:
{
  "summary": "A brief 2-3 sentence overview of the report",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "abnormalValues": [
    {
      "parameter": "Parameter name",
      "value": "Actual value",
      "normalRange": "Normal range",
      "severity": "Normal/Slightly Abnormal/Abnormal/Critical"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "healthInsights": "Detailed health insights based on the report",
  "nextSteps": ["Next step 1", "Next step 2"]
}

IMPORTANT GUIDELINES:
- Be accurate and professional
- Use simple, clear language that patients can understand
- Focus on actionable insights
- Do NOT provide medical diagnosis or prescribe medications
- Always recommend consulting healthcare professionals for serious concerns
- If values are abnormal, explain what they might indicate (not diagnose)
- Provide lifestyle and dietary suggestions when appropriate
- Be empathetic and supportive in tone

Return ONLY the JSON object, no additional text.`;
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

    const model = getGeminiModel();
    const prompt = createMedicalAnalysisPrompt(extractedText, patientInfo);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let analysisText = response.text();

    console.log("Gemini analysis completed");

    // Clean the response (remove markdown code blocks if present)
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      // Try to extract JSON from text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI analysis response");
      }
    }

    // Validate and structure the response
    const structuredAnalysis = {
      summary: analysis.summary || "Analysis completed successfully",
      keyFindings: Array.isArray(analysis.keyFindings)
        ? analysis.keyFindings
        : [],
      abnormalValues: Array.isArray(analysis.abnormalValues)
        ? analysis.abnormalValues
        : [],
      recommendations: Array.isArray(analysis.recommendations)
        ? analysis.recommendations
        : [],
      healthInsights: analysis.healthInsights || "",
      nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
      analyzedAt: new Date(),
      isAnalyzed: true,
    };

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

    const prompt = `Analyze this medical report image and extract all relevant information. 
Patient: ${patientInfo.name}, Age: ${patientInfo.age}, Gender: ${patientInfo.gender}

Provide analysis in this JSON format:
{
  "extractedText": "All text visible in the image",
  "summary": "Brief summary of findings",
  "keyFindings": ["Finding 1", "Finding 2"],
  "abnormalValues": [{"parameter": "Name", "value": "Value", "normalRange": "Range", "severity": "Level"}],
  "recommendations": ["Recommendation 1"],
  "healthInsights": "Insights",
  "nextSteps": ["Step 1"]
}

Return only JSON, no additional text.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let analysisText = response.text();

    console.log("Gemini Vision analysis completed");

    // Clean and parse response
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse Vision AI response");
      }
    }

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
        return `
REPORT ${index + 1}:
Type: ${report.reportType}
Date: ${new Date(report.reportDate).toLocaleDateString()}
Summary: ${report.aiAnalysis?.summary || "Not analyzed"}
Key Findings: ${report.aiAnalysis?.keyFindings?.join(", ") || "None"}
`;
      })
      .join("\n---\n");

    const prompt = `You are a medical AI assistant. Review the following medical reports for a patient and provide a comprehensive health summary.

PATIENT INFORMATION:
- Name: ${patientInfo.name}
- Age: ${patientInfo.age}
- Gender: ${patientInfo.gender}
- Blood Group: ${patientInfo.bloodGroup || "Not specified"}
- Allergies: ${patientInfo.allergies?.join(", ") || "None"}
- Chronic Conditions: ${patientInfo.chronicConditions?.join(", ") || "None"}

MEDICAL REPORTS:
${reportsText}

Provide a comprehensive health summary including:
1. Overall health status
2. Trends observed across reports
3. Areas of concern
4. Positive developments
5. General recommendations

Keep it clear, concise, and patient-friendly. Avoid medical jargon where possible.`;

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

    const prompt = `You are a medical AI assistant helping a patient understand their medical report.

PATIENT: ${patientInfo.name}, ${patientInfo.age} years old, ${
      patientInfo.gender
    }

REPORT ANALYSIS:
${JSON.stringify(reportAnalysis, null, 2)}

PATIENT QUESTION: ${question}

Provide a clear, empathetic, and informative answer. Use simple language that a non-medical person can understand. Always remind them to consult healthcare professionals for medical advice.`;

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
