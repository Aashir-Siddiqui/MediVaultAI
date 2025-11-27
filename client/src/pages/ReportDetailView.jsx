import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  User,
  Download,
  Trash2,
  Eye,
  Loader,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Droplet,
  Phone,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const ReportDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const reportRes = await api.get(`/reports/${id}`);
      setReport(reportRes.data.report);
    } catch (error) {
      toast.error("Failed to load report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // âœ… FIXED: Proper download using blob
  const handleDownload = async () => {
    try {
      setDownloading(true);
      toast.loading("Preparing download...", { id: "download" });

      // Get download URL from backend
      const { data } = await api.get(`/reports/${id}/download`);

      // Fetch the file as blob (this enables actual download)
      const response = await fetch(data.file.url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = data.file.fileName || "report.jpg";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup blob URL
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

      toast.success("Download started!", { id: "download" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report", { id: "download" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    setDeleting(true);
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted successfully");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to delete report");
      setDeleting(false);
    }
  };

  const openImageInNewTab = () => {
    if (report?.reportFile?.url) {
      window.open(report.reportFile.url, "_blank");
    }
  };

  const StatusBadge = ({ status, isAnalyzed }) => {
    if (isAnalyzed) {
      return (
        <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold bg-green-500 text-white flex items-center gap-1.5 md:gap-2">
          <CheckCircle2 size={14} className="md:w-4 md:h-4" />
          Analyzed
        </span>
      );
    }

    const statusConfig = {
      Processing: {
        color: "bg-yellow-500",
        icon: <Clock size={14} className="md:w-4 md:h-4" />,
        text: "Processing",
      },
      Failed: {
        color: "bg-red-500",
        icon: <XCircle size={14} className="md:w-4 md:h-4" />,
        text: "Failed",
      },
      Uploaded: {
        color: "bg-blue-500",
        icon: <FileText size={14} className="md:w-4 md:h-4" />,
        text: "Ready",
      },
    };

    const config = statusConfig[status] || statusConfig.Uploaded;

    return (
      <span
        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold ${config.color} text-white flex items-center gap-1.5 md:gap-2`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader
            className="animate-spin text-teal-600 mx-auto mb-4"
            size={40}
          />
          <p className="text-gray-500 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 px-4">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Report Not Found
        </h3>
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:underline cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {report.aiAnalysis?.isAnalyzed && (
                <Link
                  to={`/analysis/${report._id}`}
                  className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg md:rounded-xl transition flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">View Analysis</span>
                  <span className="sm:hidden">Analysis</span>
                </Link>
              )}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg md:rounded-xl transition flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50 cursor-pointer"
              >
                {downloading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                Download
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg md:rounded-xl transition flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Report Title & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {report.reportType}
              </h1>
              <p className="text-sm md:text-base text-gray-500">
                Uploaded on{" "}
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <StatusBadge
              status={report.status}
              isAnalyzed={report.aiAnalysis?.isAnalyzed}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Report Image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-teal-600 md:w-6 md:h-6" />
                  <span className="text-base md:text-xl">Report Document</span>
                </h2>
                <button
                  onClick={openImageInNewTab}
                  className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium text-xs md:text-sm cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </button>
              </div>

              <div
                onClick={openImageInNewTab}
                className="relative rounded-lg md:rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-teal-500 transition group"
              >
                <img
                  src={report.reportFile.url}
                  alt={report.reportType}
                  className="w-full h-auto object-contain bg-gray-50"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 px-3 md:px-4 py-2 rounded-lg flex items-center gap-2">
                    <ExternalLink size={16} />
                    <span className="font-medium text-sm md:text-base">
                      Click to open
                    </span>
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">
                      File Name
                    </p>
                    <p className="font-medium text-gray-900 truncate text-sm md:text-base">
                      {report.reportFile.fileName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">
                      File Size
                    </p>
                    <p className="font-medium text-gray-900 text-sm md:text-base">
                      {(report.reportFile.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-teal-600 md:w-5 md:h-5" />
                Patient Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <User className="text-gray-400 mt-1" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                      {report.familyMemberId.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {report.familyMemberId.relation}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Calendar className="text-gray-400 mt-1" size={16} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                      {report.familyMemberId.age} years
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Activity className="text-gray-400 mt-1" size={16} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                      {report.familyMemberId.gender}
                    </p>
                  </div>
                </div>
                {report.familyMemberId.bloodGroup && (
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <Droplet className="text-red-400 mt-1" size={16} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Blood Group</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">
                        {report.familyMemberId.bloodGroup}
                      </p>
                    </div>
                  </div>
                )}
                {report.familyMemberId.emergencyContact && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Emergency Contact</p>
                      <p className="font-semibold text-gray-900 text-sm break-all">
                        {report.familyMemberId.emergencyContact}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Report Details */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-teal-600 md:w-5 md:h-5" />
                Report Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Calendar className="text-gray-400 mt-1" size={16} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Report Date</p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                      {new Date(report.reportDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {report.hospitalName && (
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <Building2 className="text-gray-400 mt-1" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Hospital</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base break-words">
                        {report.hospitalName}
                      </p>
                    </div>
                  </div>
                )}
                {report.doctorName && (
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <User className="text-gray-400 mt-1" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Doctor</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base break-words">
                        Dr. {report.doctorName}
                      </p>
                    </div>
                  </div>
                )}
                {report.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="text-gray-400 mt-1" size={16} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm text-gray-700 mt-1 break-words">
                        {report.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Health Alerts */}
            {(report.familyMemberId.allergies?.length > 0 ||
              report.familyMemberId.chronicConditions?.length > 0) && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl md:rounded-2xl border border-orange-200 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="md:w-5 md:h-5" />
                  Health Alerts
                </h3>
                {report.familyMemberId.allergies?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-orange-700 mb-2">
                      ALLERGIES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.familyMemberId.allergies.map((allergy, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {report.familyMemberId.chronicConditions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-2">
                      CHRONIC CONDITIONS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.familyMemberId.chronicConditions.map(
                        (condition, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                          >
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailView;
