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
  Sparkles,
  TrendingUp,
  Shield,
  Target,
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
        try {
          const reportRes = await api.get(`/reports/${id}`);
          setReport(reportRes.data.report);

          if (reportRes.data.report.status === "Processing") {
            toast("Report is being analyzed. Please wait...", { icon: "⏳" });
            pollForAnalysis();
          } else {
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
      setReport(response.data.report);
      setAnalysis(response.data.report.aiAnalysis);
      setAnalyzing(false);
      setLoading(false);
    } catch (error) {
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
    if (!window.confirm("Are you sure you want to regenerate the analysis?"))
      return;

    setAnalyzing(true);
    setError(null);

    try {
      toast.loading("Regenerating analysis...", { id: "regen" });
      const response = await api.post(`/analysis/regenerate/${id}`);
      const updatedReport = response.data.report;

      setReport({
        ...report,
        type: updatedReport.reportType || report.type,
        date: updatedReport.reportDate || report.date,
        hospital: updatedReport.hospitalName || report.hospital,
        doctor: updatedReport.doctorName || report.doctor,
        status: updatedReport.status,
        aiAnalysis: updatedReport.aiAnalysis,
      });

      setAnalysis(updatedReport.aiAnalysis);
      setEditData({
        reportType: updatedReport.reportType || report.type,
        hospitalName: updatedReport.hospitalName || report.hospital,
        doctorName: updatedReport.doctorName || report.doctor,
        notes: updatedReport.notes || editData.notes,
      });

      toast.success("Analysis regenerated successfully!", { id: "regen" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to regenerate analysis",
        { id: "regen" }
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
      toast.error("Failed to download PDF", { id: "pdf" });
    }
  };

  const sendEmail = async () => {
    if (!window.confirm("Send this analysis report to your email?")) return;

    setSendingEmail(true);
    try {
      toast.loading("Sending email...", { id: "email" });
      await api.post(`/analysis/${id}/send-email`);
      toast.success("Analysis sent to your email successfully!", {
        id: "email",
      });
    } catch (error) {
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
    if (s === "critical") return "from-red-50 to-rose-100 border-red-300";
    if (s === "abnormal")
      return "from-orange-50 to-amber-100 border-orange-300";
    if (s?.includes("slightly"))
      return "from-yellow-50 to-orange-100 border-yellow-300";
    return "from-green-50 to-emerald-100 border-green-300";
  };

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === "critical")
      return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200";
    if (s === "abnormal")
      return "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200";
    if (s?.includes("slightly"))
      return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-200";
    return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200";
  };

  if (loading || analyzing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-ping opacity-20"></div>
            <Loader className="animate-spin text-teal-600 w-20 h-20" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">
            {analyzing ? "Analyzing with AI..." : "Loading report..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">{error}</h3>
          <p className="text-gray-600 mb-8">
            Something went wrong. Please try again.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              Go Back
            </button>
            <button
              onClick={fetchReportAndAnalysis}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl transition-all font-bold flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <FileText className="text-gray-300 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No analysis data available
          </h3>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-teal-600 hover:underline font-semibold cursor-pointer"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-all font-bold group cursor-pointer"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back</span>
            </button>
            <div className="flex gap-2 flex-wrap">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
              <button
                onClick={regenerateAnalysis}
                disabled={analyzing}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm font-bold cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
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
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm font-bold cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
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
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl cursor-pointer transition-all flex items-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
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
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Report Details
                </h3>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  {[
                    {
                      label: "Type",
                      value: editData.reportType,
                      key: "reportType",
                    },
                    {
                      label: "Hospital",
                      value: editData.hospitalName,
                      key: "hospitalName",
                    },
                    {
                      label: "Doctor",
                      value: editData.doctorName,
                      key: "doctorName",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none text-sm transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none text-sm transition-all"
                      rows="3"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-bold shadow-lg cursor-pointer"
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
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  {[
                    { icon: Activity, label: "Type", value: report.type },
                    {
                      icon: Calendar,
                      label: "Date",
                      value: new Date(report.date).toLocaleDateString(),
                    },
                    {
                      icon: User,
                      label: "Patient",
                      value: report.patient.name,
                      sub: report.patient.relation,
                    },
                    {
                      icon: Building2,
                      label: "Hospital",
                      value: report.hospital,
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="text-teal-600" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-500 text-xs font-semibold mb-1">
                            {item.label}
                          </p>
                          <p className="font-bold text-gray-900 truncate">
                            {item.value}
                          </p>
                          {item.sub && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-3xl border-2 border-blue-200 shadow-xl shadow-blue-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-blue-900">Quick Summary</h3>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {analysis.abnormalValues?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border-l-4 border-orange-500 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Values Requiring Attention
                  </h2>
                </div>
                <div className="grid gap-4">
                  {analysis.abnormalValues.map((item, i) => (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border-2 bg-gradient-to-br ${getSeverityColor(
                        item.severity
                      )} shadow-lg`}
                    >
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <h4 className="font-bold text-gray-900 flex-1 text-lg">
                          {item.parameter}
                        </h4>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getSeverityBadge(
                            item.severity
                          )} whitespace-nowrap`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700 font-semibold">
                          Value:{" "}
                          <span className="font-mono font-bold text-gray-900 bg-white/60 px-3 py-1 rounded-lg">
                            {item.value}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Normal Range: {item.normalRange}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.keyFindings?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Target size={24} className="text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Key Findings
                  </h2>
                </div>
                <ul className="space-y-4">
                  {analysis.keyFindings.map((finding, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    >
                      <CheckCircle
                        className="text-green-600 mt-1 flex-shrink-0"
                        size={22}
                      />
                      <span className="text-gray-800 leading-relaxed font-medium">
                        {finding}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.healthInsights && (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl border-2 border-purple-200 p-6 shadow-xl shadow-purple-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-purple-900">
                    Health Insights
                  </h2>
                </div>
                <p className="text-purple-900 leading-relaxed font-medium">
                  {analysis.healthInsights}
                </p>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl border-2 border-green-200 p-6 shadow-xl shadow-green-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Shield size={24} className="text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-green-900">
                    AI Recommendations
                  </h2>
                </div>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex gap-4 bg-white/80 backdrop-blur p-5 rounded-2xl border-2 border-green-200 shadow-lg"
                    >
                      <span className="bg-gradient-to-br from-green-500 to-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold flex-shrink-0 shadow-lg">
                        {i + 1}
                      </span>
                      <p className="text-green-900 leading-relaxed font-medium">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.nextSteps?.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-3xl border-2 border-cyan-200 p-6 shadow-xl shadow-cyan-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-cyan-900">
                    Next Steps
                  </h2>
                </div>
                <div className="space-y-4">
                  {analysis.nextSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-4 bg-white/80 backdrop-blur p-5 rounded-2xl border-2 border-cyan-200 shadow-lg"
                    >
                      <span className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold flex-shrink-0 shadow-lg">
                        {i + 1}
                      </span>
                      <p className="text-cyan-900 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-xl shadow-amber-100/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-2 text-lg">
                    Medical Disclaimer
                  </h3>
                  <p className="text-amber-800 leading-relaxed">
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
      </div>
    </div>
  );
};

export default ReportAnalysis;
