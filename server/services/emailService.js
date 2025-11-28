import transporter from "../config/nodemailer.js";
import { generateAnalysisPDF } from "./pdfService.js";
import dotenv from "dotenv";

dotenv.config();

const senderEmail = process.env.SENDER_EMAIL;

// Send analysis email with PDF attachment
export const sendAnalysisEmail = async (userEmail, userName, analysisData) => {
  try {
    console.log("Generating PDF for email attachment");

    // Generate PDF
    const pdfBuffer = await generateAnalysisPDF(analysisData);

    const mailOptions = {
      from: senderEmail,
      to: userEmail,
      subject: `📊 Medical Report Analysis - ${analysisData.reportType}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .content {
      background: #f9f9f9;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary-box {
      background: white;
      padding: 20px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #777;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .disclaimer {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 Medical Report Analysis Ready</h1>
    <p>Your AI-powered health insights are here</p>
  </div>

  <div class="content">
    <h2>Hello ${userName},</h2>
    
    <p>Your medical report analysis has been completed successfully! 🎉</p>
    
    <div class="summary-box">
      <h3>Report Details:</h3>
      <p><strong>Type:</strong> ${analysisData.reportType}</p>
      <p><strong>Date:</strong> ${new Date(
        analysisData.reportDate
      ).toLocaleDateString()}</p>
      <p><strong>Patient:</strong> ${analysisData.patientName}</p>
    </div>

    <h3>Quick Summary:</h3>
    <p>${analysisData.summary}</p>

    <p>
      <strong>📎 Attached:</strong> Detailed analysis report in PDF format
    </p>

    <p>
      The attached PDF contains:
    </p>
    <ul>
      <li>✓ Complete analysis summary</li>
      <li>✓ Key findings and observations</li>
      <li>✓ Test results with normal ranges</li>
      <li>✓ Personalized recommendations</li>
      <li>✓ Next steps for your health</li>
    </ul>

    <div class="disclaimer">
      <strong>⚠️ Important:</strong> This analysis is AI-generated and for informational purposes only. 
      Always consult with qualified healthcare professionals for medical advice and treatment decisions.
    </div>

    <p>
      You can also view this analysis anytime by logging into your Health Records dashboard.
    </p>
  </div>

  <div class="footer">
    <p><strong>Health Records Management System</strong></p>
    <p>This is an automated email. Please do not reply.</p>
    <p>If you have questions, please consult your healthcare provider.</p>
  </div>
</body>
</html>
      `,
      attachments: [
        {
          filename: `analysis-${analysisData.reportType.replace(
            /\s+/g,
            "-"
          )}-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Analysis email sent successfully to:", userEmail);

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send analysis email: ${error.message}`);
  }
};

// Send health summary email
export const sendHealthSummaryEmail = async (
  userEmail,
  userName,
  summaryData
) => {
  try {
    const mailOptions = {
      from: senderEmail,
      to: userEmail,
      subject: `📋 Your Comprehensive Health Summary`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .content {
      background: #f9f9f9;
      padding: 25px;
      border-radius: 8px;
    }
    .summary-text {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      white-space: pre-line;
    }
    .footer {
      text-align: center;
      color: #777;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Your Health Summary</h1>
    <p>Based on ${summaryData.reportCount} medical reports</p>
  </div>

  <div class="content">
    <h2>Hello ${userName},</h2>
    
    <p>We've analyzed your recent medical reports and generated a comprehensive health summary for you.</p>

    <div class="summary-text">
      ${summaryData.summary}
    </div>

    <p>
      This summary is based on ${summaryData.reportCount} reports spanning from 
      ${new Date(summaryData.dateRange.oldest).toLocaleDateString()} to 
      ${new Date(summaryData.dateRange.latest).toLocaleDateString()}.
    </p>

    <p>
      <strong>Remember:</strong> This is an AI-generated summary. Always consult with your healthcare 
      provider for personalized medical advice.
    </p>
  </div>

  <div class="footer">
    <p><strong>Health Records Management System</strong></p>
    <p>Your health, our priority</p>
  </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Health summary email sent successfully");

    return true;
  } catch (error) {
    console.error("Health summary email error:", error);
    throw new Error(`Failed to send health summary email: ${error.message}`);
  }
};

// Send analysis completion notification (simple)
export const sendAnalysisNotification = async (
  userEmail,
  userName,
  reportType
) => {
  try {
    const mailOptions = {
      from: senderEmail,
      to: userEmail,
      subject: `✅ Report Analysis Complete - ${reportType}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .notification {
      background: #4caf50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
    }
    .content {
      padding: 20px;
      background: #f9f9f9;
      margin-top: 20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="notification">
    <h2>✅ Analysis Complete!</h2>
  </div>
  
  <div class="content">
    <p>Hello ${userName},</p>
    <p>Your ${reportType} analysis is now ready to view in your dashboard.</p>
    <p>Log in to see detailed insights and recommendations.</p>
  </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Analysis notification sent");

    return true;
  } catch (error) {
    console.error("Notification email error:", error);
    // Don't throw error for notification failures
    return false;
  }
};
