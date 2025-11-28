export const generateReportHTML = (data) => {
  const {
    patientName,
    age,
    gender,
    bloodGroup,
    reportType,
    reportDate,
    hospitalName,
    doctorName,
    summary,
    keyFindings,
    abnormalValues,
    recommendations,
    healthInsights,
    nextSteps,
    allergies,
    chronicConditions,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Report Analysis - ${patientName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 0;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
    }

    /* Modern Header with Gradient */
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
      color: white;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }

    .header-content {
      position: relative;
      z-index: 1;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .header .subtitle {
      font-size: 16px;
      opacity: 0.95;
      font-weight: 400;
    }

    .header .generated-date {
      margin-top: 20px;
      font-size: 13px;
      opacity: 0.9;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Patient Info Card */
    .patient-card {
      background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
      border-left: 5px solid #0d9488;
      padding: 30px;
      margin: 30px 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .patient-card h2 {
      color: #0d9488;
      font-size: 20px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .patient-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .patient-field {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(13, 148, 136, 0.1);
    }

    .patient-field .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .patient-field .value {
      font-size: 16px;
      color: #0f172a;
      font-weight: 600;
    }

    /* Report Details Section */
    .report-details {
      margin: 0 40px 30px 40px;
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .report-details h3 {
      color: #334155;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: #64748b;
      font-weight: 500;
      font-size: 14px;
    }

    .detail-value {
      color: #0f172a;
      font-weight: 600;
      font-size: 14px;
    }

    /* Alert Badges */
    .alerts-section {
      margin: 0 40px 30px 40px;
      background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%);
      padding: 25px;
      border-radius: 12px;
      border-left: 5px solid #f59e0b;
    }

    .alerts-section h3 {
      color: #92400e;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .alert-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .alert-badge {
      background: white;
      color: #dc2626;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      border: 2px solid #fecaca;
    }

    /* Section Container */
    .section {
      margin: 0 40px 30px 40px;
      page-break-inside: avoid;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 3px solid #0d9488;
    }

    .section-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
    }

    .section-title {
      color: #0f172a;
      font-size: 22px;
      font-weight: 700;
      margin: 0;
    }

    /* Summary Box */
    .summary-box {
      background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
      border-left: 5px solid #3b82f6;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 25px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .summary-box p {
      color: #1e40af;
      font-size: 15px;
      line-height: 1.8;
      margin: 0;
    }

    /* Key Findings */
    .findings-list {
      list-style: none;
      padding: 0;
    }

    .finding-item {
      background: #f0fdf4;
      padding: 18px;
      margin: 12px 0;
      border-left: 4px solid #10b981;
      border-radius: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .finding-icon {
      width: 24px;
      height: 24px;
      background: #10b981;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .finding-text {
      color: #065f46;
      font-size: 14px;
      line-height: 1.6;
      flex: 1;
    }

    /* Abnormal Values Table */
    .values-container {
      margin: 20px 0;
    }

    .value-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .value-card.critical {
      border-left: 5px solid #dc2626;
      background: #fef2f2;
    }

    .value-card.abnormal {
      border-left: 5px solid #f97316;
      background: #fff7ed;
    }

    .value-card.slightly-abnormal {
      border-left: 5px solid #eab308;
      background: #fefce8;
    }

    .value-card.normal {
      border-left: 5px solid #10b981;
      background: #f0fdf4;
    }

    .value-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .parameter-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 16px;
    }

    .severity-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .severity-badge.critical {
      background: #dc2626;
      color: white;
    }

    .severity-badge.abnormal {
      background: #f97316;
      color: white;
    }

    .severity-badge.slightly-abnormal {
      background: #eab308;
      color: white;
    }

    .severity-badge.normal {
      background: #10b981;
      color: white;
    }

    .value-details {
      color: #475569;
      font-size: 14px;
      line-height: 1.8;
    }

    .value-details strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* Recommendations */
    .recommendations-container {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 30px;
      border-radius: 12px;
      margin: 20px 0;
    }

    .recommendation-item {
      background: white;
      padding: 18px;
      margin: 12px 0;
      border-radius: 8px;
      display: flex;
      gap: 15px;
      align-items: flex-start;
      border: 1px solid #a7f3d0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .recommendation-number {
      width: 32px;
      height: 32px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .recommendation-text {
      color: #065f46;
      font-size: 14px;
      line-height: 1.7;
      flex: 1;
    }

    /* Health Insights */
    .insights-box {
      background: linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%);
      border-left: 5px solid #a855f7;
      padding: 25px;
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .insights-box p {
      color: #581c87;
      font-size: 15px;
      line-height: 1.8;
      margin: 0;
    }

    /* Next Steps */
    .steps-container {
      background: linear-gradient(135deg, #cffafe 0%, #bae6fd 100%);
      padding: 30px;
      border-radius: 12px;
      margin: 20px 0;
    }

    .step-item {
      background: white;
      padding: 18px;
      margin: 12px 0;
      border-radius: 8px;
      display: flex;
      gap: 15px;
      align-items: flex-start;
      border: 1px solid #bae6fd;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .step-number {
      width: 32px;
      height: 32px;
      background: #0ea5e9;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .step-text {
      color: #075985;
      font-size: 14px;
      line-height: 1.7;
      flex: 1;
    }

    /* Disclaimer */
    .disclaimer {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #fbbf24;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 40px;
    }

    .disclaimer h3 {
      color: #92400e;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .disclaimer p {
      color: #78350f;
      font-size: 13px;
      line-height: 1.8;
      margin: 0;
    }

    /* Footer */
    .footer {
      background: #f8fafc;
      text-align: center;
      padding: 30px 40px;
      margin-top: 40px;
      border-top: 3px solid #e2e8f0;
    }

    .footer .brand {
      font-size: 18px;
      font-weight: 700;
      color: #0d9488;
      margin-bottom: 8px;
    }

    .footer .tagline {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 15px;
    }

    .footer .confidential {
      color: #94a3b8;
      font-size: 11px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
    }

    /* Page Break Control */
    @media print {
      .section {
        page-break-inside: avoid;
      }
      
      .value-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1>🏥 Medical Report Analysis</h1>
        <p class="subtitle">AI-Powered Health Insights & Recommendations</p>
        <p class="generated-date">
          Generated on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>

    <!-- Patient Information -->
    <div class="patient-card">
      <h2>👤 Patient Information</h2>
      <div class="patient-grid">
        <div class="patient-field">
          <div class="label">Full Name</div>
          <div class="value">${patientName || "N/A"}</div>
        </div>
        <div class="patient-field">
          <div class="label">Age</div>
          <div class="value">${age || "N/A"} years</div>
        </div>
        <div class="patient-field">
          <div class="label">Gender</div>
          <div class="value">${gender || "N/A"}</div>
        </div>
        <div class="patient-field">
          <div class="label">Blood Group</div>
          <div class="value">${bloodGroup || "Not specified"}</div>
        </div>
      </div>
    </div>

    <!-- Report Details -->
    <div class="report-details">
      <h3>📋 Report Details</h3>
      <div class="detail-row">
        <span class="detail-label">Report Type</span>
        <span class="detail-value">${reportType || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Report Date</span>
        <span class="detail-value">${
          reportDate ? new Date(reportDate).toLocaleDateString() : "N/A"
        }</span>
      </div>
      ${
        hospitalName
          ? `
      <div class="detail-row">
        <span class="detail-label">Hospital</span>
        <span class="detail-value">${hospitalName}</span>
      </div>
      `
          : ""
      }
      ${
        doctorName
          ? `
      <div class="detail-row">
        <span class="detail-label">Doctor</span>
        <span class="detail-value">${doctorName}</span>
      </div>
      `
          : ""
      }
    </div>

    <!-- Health Alerts -->
    ${
      (allergies && allergies.length > 0) ||
      (chronicConditions && chronicConditions.length > 0)
        ? `
    <div class="alerts-section">
      <h3>⚠️ Health Alerts & Precautions</h3>
      ${
        allergies && allergies.length > 0
          ? `
      <div style="margin-top: 15px;">
        <div style="font-weight: 600; color: #92400e; margin-bottom: 8px; font-size: 13px;">KNOWN ALLERGIES</div>
        <div class="alert-badges">
          ${allergies
            .map((allergy) => `<span class="alert-badge">${allergy}</span>`)
            .join("")}
        </div>
      </div>
      `
          : ""
      }
      ${
        chronicConditions && chronicConditions.length > 0
          ? `
      <div style="margin-top: 15px;">
        <div style="font-weight: 600; color: #92400e; margin-bottom: 8px; font-size: 13px;">CHRONIC CONDITIONS</div>
        <div class="alert-badges">
          ${chronicConditions
            .map((condition) => `<span class="alert-badge">${condition}</span>`)
            .join("")}
        </div>
      </div>
      `
          : ""
      }
    </div>
    `
        : ""
    }

    <!-- Summary -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <h2 class="section-title">Executive Summary</h2>
      </div>
      <div class="summary-box">
        <p>${summary || "No summary available"}</p>
      </div>
    </div>

    <!-- Key Findings -->
    ${
      keyFindings && keyFindings.length > 0
        ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">🔍</div>
        <h2 class="section-title">Key Findings</h2>
      </div>
      <ul class="findings-list">
        ${keyFindings
          .map(
            (finding) => `
          <li class="finding-item">
            <div class="finding-icon">✓</div>
            <div class="finding-text">${finding}</div>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Abnormal Values -->
    ${
      abnormalValues && abnormalValues.length > 0
        ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">⚕️</div>
        <h2 class="section-title">Test Results & Values</h2>
      </div>
      <div class="values-container">
        ${abnormalValues
          .map((item) => {
            const severityClass = (item.severity || "Normal")
              .toLowerCase()
              .replace(" ", "-");
            return `
            <div class="value-card ${severityClass}">
              <div class="value-header">
                <span class="parameter-name">${item.parameter}</span>
                <span class="severity-badge ${severityClass}">${
              item.severity || "Normal"
            }</span>
              </div>
              <div class="value-details">
                <strong>Measured Value:</strong> ${item.value}<br>
                <strong>Normal Range:</strong> ${item.normalRange}
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- Health Insights -->
    ${
      healthInsights
        ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">💡</div>
        <h2 class="section-title">Health Insights</h2>
      </div>
      <div class="insights-box">
        <p>${healthInsights}</p>
      </div>
    </div>
    `
        : ""
    }

    <!-- Recommendations -->
    ${
      recommendations && recommendations.length > 0
        ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">💊</div>
        <h2 class="section-title">AI Recommendations</h2>
      </div>
      <div class="recommendations-container">
        ${recommendations
          .map(
            (rec, index) => `
          <div class="recommendation-item">
            <div class="recommendation-number">${index + 1}</div>
            <div class="recommendation-text">${rec}</div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- Next Steps -->
    ${
      nextSteps && nextSteps.length > 0
        ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">🎯</div>
        <h2 class="section-title">Next Steps</h2>
      </div>
      <div class="steps-container">
        ${nextSteps
          .map(
            (step, index) => `
          <div class="step-item">
            <div class="step-number">${index + 1}</div>
            <div class="step-text">${step}</div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- Disclaimer -->
    <div class="disclaimer">
      <h3>⚠️ Important Medical Disclaimer</h3>
      <p>
        <strong>This analysis is generated by Artificial Intelligence and is for informational purposes only.</strong>
        It should not be considered as professional medical advice, diagnosis, or treatment. 
        The AI analysis is based on the information provided in your medical report and general medical knowledge.
      </p>
      <p style="margin-top: 12px;">
        <strong>Always consult with qualified healthcare professionals</strong> for medical concerns, diagnosis, 
        and treatment decisions. Do not disregard professional medical advice or delay seeking it because of 
        something you have read in this analysis.
      </p>
      <p style="margin-top: 12px;">
        In case of a medical emergency, immediately call your local emergency services or go to the nearest emergency room.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="brand">MediVault AI</div>
      <div class="tagline">AI-Powered Medical Report Analysis</div>
      <div style="color: #64748b; font-size: 12px;">
        Empowering patients with intelligent health insights
      </div>
      <div class="confidential">
        <strong>CONFIDENTIAL MEDICAL DOCUMENT</strong><br>
        This document contains sensitive medical information. Handle with care.<br>
        Generated: ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
