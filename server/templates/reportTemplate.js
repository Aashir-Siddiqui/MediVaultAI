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
    chronicConditions
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Report Analysis</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 4px solid #2c3e50;
      margin-bottom: 40px;
    }

    .header h1 {
      color: #2c3e50;
      font-size: 32px;
      margin-bottom: 10px;
    }

    .header p {
      color: #7f8c8d;
      font-size: 14px;
    }

    .patient-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      margin-bottom: 30px;
    }

    .patient-info h2 {
      margin-bottom: 15px;
      font-size: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .info-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 5px;
    }

    .info-item strong {
      display: block;
      margin-bottom: 5px;
      font-size: 12px;
      opacity: 0.9;
    }

    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }

    .section-title {
      color: #2c3e50;
      font-size: 22px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3498db;
    }

    .summary-box {
      background: #e8f4f8;
      border-left: 4px solid #3498db;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }

    .findings-list {
      list-style: none;
    }

    .finding-item {
      background: #f8f9fa;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #27ae60;
      border-radius: 5px;
    }

    .abnormal-values {
      margin: 20px 0;
    }

    .value-card {
      background: white;
      border: 1px solid #dee2e6;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .value-card.normal {
      border-left: 4px solid #27ae60;
    }

    .value-card.slightly-abnormal {
      border-left: 4px solid #f39c12;
    }

    .value-card.abnormal {
      border-left: 4px solid #e67e22;
    }

    .value-card.critical {
      border-left: 4px solid #e74c3c;
    }

    .value-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .parameter-name {
      font-weight: bold;
      color: #2c3e50;
      font-size: 16px;
    }

    .severity-badge {
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
    }

    .severity-badge.normal {
      background: #d4edda;
      color: #155724;
    }

    .severity-badge.slightly-abnormal {
      background: #fff3cd;
      color: #856404;
    }

    .severity-badge.abnormal {
      background: #ffe5d9;
      color: #bf6900;
    }

    .severity-badge.critical {
      background: #f8d7da;
      color: #721c24;
    }

    .value-details {
      color: #555;
      font-size: 14px;
    }

    .recommendations {
      background: #e8f5e9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .recommendation-item {
      padding: 12px;
      margin: 8px 0;
      background: white;
      border-left: 3px solid #4caf50;
      border-radius: 4px;
    }

    .health-insights {
      background: #fff8e1;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
    }

    .next-steps {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .step-item {
      padding: 12px;
      margin: 8px 0;
      background: white;
      border-left: 3px solid #2196f3;
      border-radius: 4px;
    }

    .medical-history {
      background: #fce4ec;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .alert-item {
      display: inline-block;
      background: #d32f2f;
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      margin: 5px;
      font-size: 12px;
    }

    .disclaimer {
      background: #fff3cd;
      border: 2px solid #ffc107;
      padding: 20px;
      border-radius: 8px;
      margin: 40px 0 20px 0;
    }

    .disclaimer h3 {
      color: #856404;
      margin-bottom: 10px;
    }

    .disclaimer p {
      color: #856404;
      font-size: 14px;
      line-height: 1.8;
    }

    .footer {
      text-align: center;
      padding: 30px 0;
      border-top: 2px solid #dee2e6;
      margin-top: 40px;
      color: #7f8c8d;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🏥 Medical Report Analysis</h1>
      <p>AI-Powered Health Insights</p>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
    </div>

    <!-- Patient Information -->
    <div class="patient-info">
      <h2>Patient Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <strong>NAME</strong>
          <div>${patientName || 'N/A'}</div>
        </div>
        <div class="info-item">
          <strong>AGE</strong>
          <div>${age || 'N/A'} years</div>
        </div>
        <div class="info-item">
          <strong>GENDER</strong>
          <div>${gender || 'N/A'}</div>
        </div>
        <div class="info-item">
          <strong>BLOOD GROUP</strong>
          <div>${bloodGroup || 'Not specified'}</div>
        </div>
        <div class="info-item">
          <strong>REPORT TYPE</strong>
          <div>${reportType || 'N/A'}</div>
        </div>
        <div class="info-item">
          <strong>REPORT DATE</strong>
          <div>${reportDate ? new Date(reportDate).toLocaleDateString() : 'N/A'}</div>
        </div>
        ${hospitalName ? `
        <div class="info-item">
          <strong>HOSPITAL</strong>
          <div>${hospitalName}</div>
        </div>
        ` : ''}
        ${doctorName ? `
        <div class="info-item">
          <strong>DOCTOR</strong>
          <div>${doctorName}</div>
        </div>
        ` : ''}
      </div>
    </div>

    ${allergies && allergies.length > 0 ? `
    <div class="medical-history">
      <h3 style="color: #c62828; margin-bottom: 10px;">⚠️ Known Allergies</h3>
      ${allergies.map(allergy => `<span class="alert-item">${allergy}</span>`).join('')}
    </div>
    ` : ''}

    ${chronicConditions && chronicConditions.length > 0 ? `
    <div class="medical-history" style="background: #e8eaf6;">
      <h3 style="color: #3f51b5; margin-bottom: 10px;">📋 Chronic Conditions</h3>
      ${chronicConditions.map(condition => `
        <span class="alert-item" style="background: #3f51b5;">${condition}</span>
      `).join('')}
    </div>
    ` : ''}

    <!-- Summary -->
    <div class="section">
      <h2 class="section-title">📝 Summary</h2>
      <div class="summary-box">
        <p>${summary || 'No summary available'}</p>
      </div>
    </div>

    <!-- Key Findings -->
    ${keyFindings && keyFindings.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🔍 Key Findings</h2>
      <ul class="findings-list">
        ${keyFindings.map(finding => `
          <li class="finding-item">✓ ${finding}</li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Abnormal Values -->
    ${abnormalValues && abnormalValues.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⚕️ Test Results & Values</h2>
      <div class="abnormal-values">
        ${abnormalValues.map(item => {
          const severityClass = (item.severity || 'Normal').toLowerCase().replace(' ', '-');
          return `
            <div class="value-card ${severityClass}">
              <div class="value-header">
                <span class="parameter-name">${item.parameter}</span>
                <span class="severity-badge ${severityClass}">${item.severity || 'Normal'}</span>
              </div>
              <div class="value-details">
                <p><strong>Value:</strong> ${item.value}</p>
                <p><strong>Normal Range:</strong> ${item.normalRange}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Health Insights -->
    ${healthInsights ? `
    <div class="section">
      <h2 class="section-title">💡 Health Insights</h2>
      <div class="health-insights">
        <p>${healthInsights}</p>
      </div>
    </div>
    ` : ''}

    <!-- Recommendations -->
    ${recommendations && recommendations.length > 0 ? `
    <div class="section">
      <h2 class="section-title">💊 Recommendations</h2>
      <div class="recommendations">
        ${recommendations.map((rec, index) => `
          <div class="recommendation-item">
            <strong>${index + 1}.</strong> ${rec}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Next Steps -->
    ${nextSteps && nextSteps.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🎯 Next Steps</h2>
      <div class="next-steps">
        ${nextSteps.map((step, index) => `
          <div class="step-item">
            <strong>Step ${index + 1}:</strong> ${step}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Disclaimer -->
    <div class="disclaimer">
      <h3>⚠️ Important Medical Disclaimer</h3>
      <p>
        <strong>This analysis is generated by Artificial Intelligence and is for informational purposes only.</strong>
        It should not be considered as professional medical advice, diagnosis, or treatment. 
        The AI analysis is based on the information provided in your medical report and general medical knowledge.
      </p>
      <p style="margin-top: 10px;">
        <strong>Always consult with qualified healthcare professionals</strong> for medical concerns, diagnosis, 
        and treatment decisions. Do not disregard professional medical advice or delay seeking it because of 
        something you have read in this analysis.
      </p>
      <p style="margin-top: 10px;">
        In case of a medical emergency, immediately call your local emergency services or go to the nearest emergency room.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Health Records Management System</strong></p>
      <p>AI-Powered Medical Report Analysis</p>
      <p>This is a confidential medical document. Handle with care.</p>
      <p style="margin-top: 10px;">Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
};