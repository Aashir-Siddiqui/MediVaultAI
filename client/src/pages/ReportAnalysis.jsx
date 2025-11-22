import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import MedicalLoader from "../components/MedicalLoader";
import {
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowLeft,
  RefreshCw,
  Activity,
  User as UserIcon,
  Calendar,
  Building2,
  AlertCircle,
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

  useEffect(() => {
    fetchReportAndAnalysis();
  }, [id]);

  const fetchReportAndAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, try to get the analysis
      const analysisRes = await api.get(`/analysis/${id}`);
      setReport(analysisRes.data.analysis.report);
      setAnalysis(analysisRes.data.analysis.aiAnalysis);
      setLoading(false);
    } catch (error) {
      // If analysis doesn't exist (400), try to get report and analyze
      if (error.response?.status === 400) {
        try {
          const reportRes = await api.get(`/reports/${id}`);
          setReport(reportRes.data.report);

          // Check if report is already being processed
          if (reportRes.data.report.status === "Processing") {
            toast("Report is being analyzed. Please wait...", { icon: "⏳" });
            setLoading(false);
            // Poll for completion
            pollForAnalysis();
          } else {
            // Trigger analysis
            triggerAnalysis();
          }
        } catch (reportError) {
          console.error("Report fetch error:", reportError);
          setError("Report not found");
          setLoading(false);
        }
      } else {
        console.error("Analysis fetch error:", error);
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
      console.error("Analysis error:", error);
      toast.error(error.response?.data?.message || "Analysis failed", {
        id: "analyzing",
      });
      setError("Failed to analyze report. Please try again.");
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const pollForAnalysis = async () => {
    const pollInterval = setInterval(async () => {
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
        // Still processing, continue polling
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setLoading(false);
      setError("Analysis is taking longer than expected. Please refresh.");
    }, 120000);
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

  const regenerateAnalysis = async () => {
    if (!window.confirm("Are you sure you want to regenerate the analysis?")) {
      return;
    }

    setAnalyzing(true);
    try {
      toast.loading("Regenerating analysis...", { id: "regen" });

      const response = await api.post(`/analysis/regenerate/${id}`);

      setReport(response.data.report);
      setAnalysis(response.data.report.aiAnalysis);

      toast.success("Analysis regenerated!", { id: "regen" });
    } catch (error) {
      toast.error("Failed to regenerate analysis", { id: "regen" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || analyzing) {
    return (
      <MedicalLoader
        text={analyzing ? "Analyzing with AI..." : "Loading report..."}
      />
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{error}</h3>
        <div className="flex gap-4 justify-center mt-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex gap-3">
          <button
            onClick={regenerateAnalysis}
            disabled={analyzing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} />
            Regenerate
          </button>
          <button
            onClick={downloadPdf}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <FileText size={20} className="text-teal-600" />
              Report Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <Activity className="text-gray-400 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Type</p>
                  <p className="font-semibold text-gray-900">{report.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <Calendar className="text-gray-400 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <UserIcon className="text-gray-400 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Patient</p>
                  <p className="font-semibold text-gray-900">
                    {report.patient.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.patient.relation}
                  </p>
                </div>
              </div>
              {report.hospital && (
                <div className="flex items-start gap-3">
                  <Building2 className="text-gray-400 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-gray-500 text-xs">Hospital</p>
                    <p className="font-medium text-gray-900">
                      {report.hospital}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
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
          {/* Abnormal Values */}
          {analysis.abnormalValues && analysis.abnormalValues.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" size={24} />
                Values Requiring Attention
              </h2>
              <div className="grid gap-4">
                {analysis.abnormalValues.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 flex justify-between items-center ${
                      item.severity === "Critical"
                        ? "bg-red-50 border-red-200"
                        : item.severity === "Abnormal"
                        ? "bg-orange-50 border-orange-200"
                        : item.severity === "Slightly Abnormal"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">
                        {item.parameter}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Value:{" "}
                        <span className="font-mono font-bold text-gray-900">
                          {item.value}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Normal: {item.normalRange}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          item.severity === "Critical"
                            ? "bg-red-500 text-white"
                            : item.severity === "Abnormal"
                            ? "bg-orange-500 text-white"
                            : item.severity === "Slightly Abnormal"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Findings */}
          {analysis.keyFindings && analysis.keyFindings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Key Findings
              </h2>
              <ul className="space-y-4">
                {analysis.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-green-500 mt-1 flex-shrink-0"
                      size={20}
                    />
                    <span className="text-gray-700 leading-relaxed">
                      {finding}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Health Insights */}
          {analysis.healthInsights && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8">
              <h2 className="text-xl font-bold text-purple-900 mb-4">
                Health Insights
              </h2>
              <p className="text-purple-800 leading-relaxed">
                {analysis.healthInsights}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8">
              <h2 className="text-xl font-bold text-green-900 mb-4">
                AI Recommendations
              </h2>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex gap-4 bg-white/60 p-4 rounded-xl border border-green-200"
                  >
                    <span className="bg-green-500 text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-green-900 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {analysis.nextSteps && analysis.nextSteps.length > 0 && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-8">
              <h2 className="text-xl font-bold text-cyan-900 mb-4">
                Next Steps
              </h2>
              <div className="space-y-3">
                {analysis.nextSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-4 bg-white/60 p-4 rounded-xl border border-cyan-200"
                  >
                    <span className="bg-cyan-500 text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-cyan-900 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} />
              Medical Disclaimer
            </h3>
            <p className="text-amber-800 text-sm leading-relaxed">
              This analysis is generated by AI and is for informational purposes
              only. It should not be considered as professional medical advice,
              diagnosis, or treatment. Always consult with qualified healthcare
              professionals for medical concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalysis;
