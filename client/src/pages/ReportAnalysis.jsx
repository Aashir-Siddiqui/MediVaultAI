import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowLeft,
  RefreshCw,
  Activity,
  User,
  Calendar,
  Building2,
  AlertCircle,
  Mail,
  Loader,
  Edit,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const ReportAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    reportType: "",
    hospitalName: "",
    doctorName: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReportAndAnalysis();
  }, [id]);

  const fetchReportAndAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const analysisRes = await api.get(`/analysis/${id}`);
      const reportData = analysisRes.data.analysis.report;
      const analysisData = analysisRes.data.analysis.aiAnalysis;

      setReport(reportData);
      setAnalysis(analysisData);
      setEditData({
        reportType: reportData.type || "",
        hospitalName: reportData.hospital || "",
        doctorName: reportData.doctor || "",
        notes: reportData.notes || "",
      });
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 400) {
        // Report not analyzed yet
        try {
          const reportRes = await api.get(`/reports/${id}`);
          setReport(reportRes.data.report);

          if (reportRes.data.report.status === "Processing") {
            toast("Report is being analyzed. Please wait...", { icon: "⏳" });
            pollForAnalysis();
          } else {
            // Trigger analysis automatically
            triggerAnalysis();
          }
        } catch (reportError) {
          setError("Report not found");
          setLoading(false);
        }
      } else {
        setError("Failed to load report");
        setLoading(false);
      }
    }
  };

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      toast.loading("Starting AI analysis...", { id: "analyzing" });

      const response = await api.post(`/analysis/analyze/${id}`);

      toast.success("Analysis completed!", { id: "analyzing" });

      // Set both report and analysis from response - NO REFRESH NEEDED
      setReport(response.data.report);
      setAnalysis(response.data.report.aiAnalysis);

      setAnalyzing(false);
      setLoading(false);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error.response?.data?.message || "Analysis failed", {
        id: "analyzing",
      });
      setError(
        error.response?.data?.message ||
          "Failed to analyze report. Please try again."
      );
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const pollForAnalysis = async () => {
    let attempts = 0;
    const maxAttempts = 40;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const analysisRes = await api.get(`/analysis/${id}`);
        if (analysisRes.data.analysis.aiAnalysis.isAnalyzed) {
          setReport(analysisRes.data.analysis.report);
          setAnalysis(analysisRes.data.analysis.aiAnalysis);
          setLoading(false);
          clearInterval(pollInterval);
          toast.success("Analysis completed!");
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setLoading(false);
          setError("Analysis is taking longer than expected. Please refresh.");
        }
      }
    }, 3000);
  };

  const regenerateAnalysis = async () => {
    if (!window.confirm("Are you sure you want to regenerate the analysis?")) {
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      toast.loading("Regenerating analysis...", { id: "regen" });

      const response = await api.post(`/analysis/regenerate/${id}`);

      // ✅ FIXED: Properly update both report and analysis state
      const updatedReport = response.data.report;

      // Update report state
      setReport({
        ...report,
        type: updatedReport.reportType || report.type,
        date: updatedReport.reportDate || report.date,
        hospital: updatedReport.hospitalName || report.hospital,
        doctor: updatedReport.doctorName || report.doctor,
        status: updatedReport.status,
        aiAnalysis: updatedReport.aiAnalysis,
      });

      // Update analysis state - THIS WAS MISSING!
      setAnalysis(updatedReport.aiAnalysis);

      // Update edit data
      setEditData({
        reportType: updatedReport.reportType || report.type,
        hospitalName: updatedReport.hospitalName || report.hospital,
        doctorName: updatedReport.doctorName || report.doctor,
        notes: updatedReport.notes || editData.notes,
      });

      toast.success("Analysis regenerated successfully!", { id: "regen" });
    } catch (error) {
      console.error("Regenerate error:", error);
      toast.error(
        error.response?.data?.message || "Failed to regenerate analysis",
        {
          id: "regen",
        }
      );
      setError("Failed to regenerate analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadPdf = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf" });

      const response = await api.get(`/analysis/${id}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${report.type}-analysis-${Date.now()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded!", { id: "pdf" });
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF", { id: "pdf" });
    }
  };

  const sendEmail = async () => {
    if (!window.confirm("Send this analysis report to your email?")) {
      return;
    }

    setSendingEmail(true);
    try {
      toast.loading("Sending email...", { id: "email" });

      await api.post(`/analysis/${id}/send-email`);

      toast.success("Analysis sent to your email successfully!", {
        id: "email",
      });
    } catch (error) {
      console.error("Email send error:", error);
      toast.error(error.response?.data?.message || "Failed to send email", {
        id: "email",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/reports/${id}`, editData);

      // Update local state - NO REFRESH NEEDED
      setReport({
        ...report,
        type: editData.reportType,
        hospital: editData.hospitalName,
        doctor: editData.doctorName,
      });

      setEditMode(false);
      toast.success("Report updated successfully!");
    } catch (error) {
      toast.error("Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (severity) => {
    const s = severity?.toLowerCase();
    if (s === "critical") return "bg-red-50 border-red-200";
    if (s === "abnormal") return "bg-orange-50 border-orange-200";
    if (s?.includes("slightly")) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === "critical") return "bg-red-500 text-white";
    if (s === "abnormal") return "bg-orange-500 text-white";
    if (s?.includes("slightly")) return "bg-yellow-500 text-white";
    return "bg-green-500 text-white";
  };

  if (loading || analyzing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader
            className="animate-spin text-teal-600 mx-auto mb-4"
            size={40}
          />
          <p className="text-gray-500 font-medium">
            {analyzing ? "Analyzing with AI..." : "Loading report..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{error}</h3>
        <div className="flex gap-4 justify-center mt-6 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition font-semibold"
          >
            Go Back
          </button>
          <button
            onClick={fetchReportAndAnalysis}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition font-semibold flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report || !analysis) {
    return (
      <div className="text-center py-20">
        <FileText className="text-gray-300 mx-auto mb-4" size={64} />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          No analysis data available
        </h3>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-teal-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex gap-2 flex-wrap justify-end">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition flex items-center gap-2 text-sm"
                  title="Edit Report Details"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
              <button
                onClick={regenerateAnalysis}
                disabled={analyzing}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50 text-sm"
                title="Regenerate AI Analysis"
              >
                <RefreshCw
                  size={16}
                  className={analyzing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
              <button
                onClick={sendEmail}
                disabled={sendingEmail}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50 text-sm"
                title="Send Report to Email"
              >
                {sendingEmail ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                <span className="hidden sm:inline">
                  {sendingEmail ? "Sending..." : "Email"}
                </span>
              </button>
              <button
                onClick={downloadPdf}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition flex items-center gap-2 text-sm"
                title="Download PDF Report"
              >
                <Download size={16} />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FileText size={20} className="text-teal-600" />
                Report Details
              </h3>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value={editData.reportType}
                      onChange={(e) =>
                        setEditData({ ...editData, reportType: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Hospital
                    </label>
                    <input
                      type="text"
                      value={editData.hospitalName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          hospitalName: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Doctor
                    </label>
                    <input
                      type="text"
                      value={editData.doctorName}
                      onChange={(e) =>
                        setEditData({ ...editData, doctorName: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                      rows="3"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <Activity
                      className="text-gray-400 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-500 text-xs">Type</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {report.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <Calendar
                      className="text-gray-400 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <User
                      className="text-gray-400 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-500 text-xs">Patient</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {report.patient.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.patient.relation}
                      </p>
                    </div>
                  </div>
                  {report.hospital && (
                    <div className="flex items-start gap-3">
                      <Building2
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                        size={16}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">Hospital</p>
                        <p className="font-medium text-gray-900 truncate">
                          {report.hospital}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FileText size={20} />
                Quick Summary
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {analysis.abnormalValues?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle
                    className="text-orange-500 flex-shrink-0"
                    size={24}
                  />
                  <span>Values Requiring Attention</span>
                </h2>
                <div className="grid gap-4">
                  {analysis.abnormalValues.map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 ${getSeverityColor(
                        item.severity
                      )}`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-gray-800 flex-1">
                          {item.parameter}
                        </h4>
                        <span
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBadge(
                            item.severity
                          )} whitespace-nowrap`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Value:{" "}
                          <span className="font-mono font-bold text-gray-900">
                            {item.value}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Normal: {item.normalRange}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.keyFindings?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                  Key Findings
                </h2>
                <ul className="space-y-3">
                  {analysis.keyFindings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle
                        className="text-green-500 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-700 text-sm md:text-base leading-relaxed">
                        {finding}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.healthInsights && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-purple-900 mb-3">
                  Health Insights
                </h2>
                <p className="text-purple-800 text-sm md:text-base leading-relaxed">
                  {analysis.healthInsights}
                </p>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-green-900 mb-4">
                  AI Recommendations
                </h2>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex gap-3 md:gap-4 bg-white/60 p-3 md:p-4 rounded-xl border border-green-200"
                    >
                      <span className="bg-green-500 text-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-green-900 text-sm md:text-base leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.nextSteps?.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-cyan-900 mb-4">
                  Next Steps
                </h2>
                <div className="space-y-3">
                  {analysis.nextSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-3 md:gap-4 bg-white/60 p-3 md:p-4 rounded-xl border border-cyan-200"
                    >
                      <span className="bg-cyan-500 text-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-cyan-900 text-sm md:text-base leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={20} className="flex-shrink-0" />
                <span>Medical Disclaimer</span>
              </h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                This analysis is generated by AI and is for informational
                purposes only. It should not be considered as professional
                medical advice, diagnosis, or treatment. Always consult with
                qualified healthcare professionals for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalysis;
