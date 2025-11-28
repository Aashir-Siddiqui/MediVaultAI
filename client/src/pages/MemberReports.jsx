import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { REPORT_TYPES } from "../utils/constant";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  User as UserIcon,
  Filter,
  Search,
  Download,
  Trash2,
  Eye,
  Upload,
  Loader,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
  Edit,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const MemberReports = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);

  const handleCardClick = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    reportType: "",
    startDate: "",
    endDate: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal
  const [editingReport, setEditingReport] = useState(null);
  const [editData, setEditData] = useState({
    reportType: "",
    hospitalName: "",
    doctorName: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Available report types from database
  const [availableReportTypes, setAvailableReportTypes] = useState([]);

  useEffect(() => {
    fetchMemberAndReports();
  }, [memberId]);

  useEffect(() => {
    // Extract unique report types from actual reports
    if (reports.length > 0) {
      const uniqueTypes = [...new Set(reports.map((r) => r.reportType))].sort();
      setAvailableReportTypes(uniqueTypes);
    }
  }, [reports]);

  const fetchMemberAndReports = async () => {
    setLoading(true);
    try {
      // Fetch member details
      const memberRes = await api.get(`/family/${memberId}`);
      setMember(memberRes.data.familyMember);

      // Fetch reports
      const reportsRes = await api.get(`/reports/member/${memberId}`);
      setReports(reportsRes.data.reports);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId, reportType) => {
    if (!window.confirm(`Delete this ${reportType} report?`)) return;

    setDeleting(reportId);
    try {
      await api.delete(`/reports/${reportId}`);
      toast.success("Report deleted successfully");
      setReports(reports.filter((r) => r._id !== reportId));
    } catch (error) {
      toast.error("Failed to delete report");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      toast.loading("Preparing download...", { id: "download" });

      // Get the download URL from backend
      const { data } = await api.get(`/reports/${reportId}/download`);

      // Fetch the file as blob (this allows actual download)
      const response = await fetch(data.file.url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "medical-report.jpg";
      link.style.display = "none";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

      toast.success("Download started!", { id: "download" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report", { id: "download" });
    }
  };

  const handleAnalyze = async (reportId) => {
    setAnalyzing(reportId);
    try {
      toast.loading("Starting AI analysis...", { id: "analyze" });

      const response = await api.post(`/analysis/analyze/${reportId}`);

      toast.success("Analysis completed!", { id: "analyze" });

      // Update report status in local state - NO REFRESH NEEDED
      setReports((prevReports) =>
        prevReports.map((r) =>
          r._id === reportId
            ? {
                ...r,
                status: "Analyzed",
                aiAnalysis: {
                  ...response.data.report.aiAnalysis,
                  isAnalyzed: true,
                },
              }
            : r
        )
      );

      // Navigate to analysis page
      navigate(`/analysis/${reportId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Analysis failed", {
        id: "analyze",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setEditData({
      reportType: report.reportType,
      hospitalName: report.hospitalName || "",
      doctorName: report.doctorName || "",
      notes: report.notes || "",
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/reports/${editingReport._id}`, editData);

      // Update local state - NO REFRESH NEEDED
      setReports((prevReports) =>
        prevReports.map((r) =>
          r._id === editingReport._id
            ? {
                ...r,
                reportType: editData.reportType,
                hospitalName: editData.hospitalName,
                doctorName: editData.doctorName,
                notes: editData.notes,
              }
            : r
        )
      );

      toast.success("Report updated successfully");
      setEditingReport(null);
    } catch (error) {
      toast.error("Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.reportType) {
      filtered = filtered.filter((r) => r.reportType === filters.reportType);
    }
    if (filters.status) {
      const statusMap = {
        Analyzed: (r) => r.aiAnalysis?.isAnalyzed,
        Processing: (r) => r.status === "Processing",
        Uploaded: (r) => r.status === "Uploaded" && !r.aiAnalysis?.isAnalyzed,
        Failed: (r) => r.status === "Failed",
      };
      filtered = filtered.filter(statusMap[filters.status]);
    }
    if (filters.startDate) {
      filtered = filtered.filter(
        (r) => new Date(r.reportDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (r) => new Date(r.reportDate) <= new Date(filters.endDate)
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredReports = applyFilters();

  // Stats calculations
  const analyzedCount = reports.filter((r) => r.aiAnalysis?.isAnalyzed).length;
  const pendingCount = reports.filter((r) => r.status === "Uploaded").length;
  const processingCount = reports.filter(
    (r) => r.status === "Processing"
  ).length;

  // Status badge component
  const StatusBadge = ({ status, isAnalyzed }) => {
    if (isAnalyzed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white flex items-center gap-1">
          <CheckCircle2 size={12} />
          Analyzed
        </span>
      );
    }

    const statusConfig = {
      Processing: {
        color: "bg-yellow-500",
        icon: <Clock size={12} />,
        text: "Processing",
      },
      Failed: {
        color: "bg-red-500",
        icon: <XCircle size={12} />,
        text: "Failed",
      },
      Uploaded: {
        color: "bg-blue-500",
        icon: <FileText size={12} />,
        text: "Ready",
      },
    };

    const config = statusConfig[status] || statusConfig.Uploaded;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} text-white flex items-center gap-1`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            className="animate-spin text-teal-600 mx-auto mb-4"
            size={40}
          />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Member Not Found
        </h3>
        <button
          onClick={() => navigate("/")}
          className="text-teal-600 hover:underline cursor-pointer"
        >
          Go back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-teal-200 bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg flex-shrink-0">
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {member.name}'s Medical Records
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 flex-wrap">
                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-200">
                  {member.relation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {member.age} years
                </span>
                {member.bloodGroup && (
                  <span className="flex items-center gap-1 text-red-600">
                    <Activity size={14} />
                    {member.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/upload"
            state={{ selectedMember: member._id }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition font-semibold transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Upload size={20} />
            Upload New Report
          </Link>
        </div>

        {/* Quick Stats */}
        {reports.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {reports.length}
                  </p>
                </div>
                <FileText className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Analyzed</p>
                  <p className="text-2xl font-bold text-green-700">
                    {analyzedCount}
                  </p>
                </div>
                <CheckCircle2 className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 font-medium">
                    Processing
                  </p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {processingCount}
                  </p>
                </div>
                <Clock className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {pendingCount}
                  </p>
                </div>
                <TrendingUp className="text-purple-500" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by type, hospital, or doctor..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-5 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-medium justify-center cursor-pointer"
          >
            <Filter size={20} />
            Filters
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white cursor-pointer"
                value={filters.reportType}
                onChange={(e) =>
                  setFilters({ ...filters, reportType: e.target.value })
                }
              >
                <option value="">All Types</option>
                {availableReportTypes.length > 0
                  ? availableReportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))
                  : REPORT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white cursor-pointer"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="Uploaded">Ready</option>
                <option value="Processing">Processing</option>
                <option value="Analyzed">Analyzed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="text-gray-300 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-500 mb-6">
            {reports.length === 0
              ? "Upload your first medical report to get started"
              : "No reports match your filters"}
          </p>
          <Link
            to="/upload"
            state={{ selectedMember: member._id }}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition font-semibold shadow-lg"
          >
            <Upload size={20} />
            Upload Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
              onClick={() => handleCardClick(report._id)} // ADD THIS
            >
              {/* Report Image Preview */}
              <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={report.reportFile.url}
                  alt={report.reportType}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div
                  className="absolute top-3 right-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StatusBadge
                    status={report.status}
                    isAnalyzed={report.aiAnalysis?.isAnalyzed}
                  />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white text-xl font-bold drop-shadow-lg">
                    {report.reportType}
                  </h3>
                </div>
              </div>

              {/* Report Details */}
              <div className="p-5">
                <div className="space-y-2.5 mb-5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={16}
                      className="text-teal-500 flex-shrink-0"
                    />
                    <span className="font-medium">
                      {new Date(report.reportDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {report.hospitalName && (
                    <div className="flex items-center gap-2">
                      <Building2
                        size={16}
                        className="text-blue-500 flex-shrink-0"
                      />
                      <span className="truncate">{report.hospitalName}</span>
                    </div>
                  )}
                  {report.doctorName && (
                    <div className="flex items-center gap-2">
                      <UserIcon
                        size={16}
                        className="text-purple-500 flex-shrink-0"
                      />
                      <span className="truncate">Dr. {report.doctorName}</span>
                    </div>
                  )}
                </div>

                {/* Actions - UPDATED with stopPropagation */}
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {report.aiAnalysis?.isAnalyzed ? (
                    <Link
                      to={`/analysis/${report._id}`}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <Eye size={16} />
                      View Analysis
                    </Link>
                  ) : report.status === "Processing" ||
                    analyzing === report._id ? (
                    <button
                      disabled
                      className="flex-1 bg-yellow-100 text-yellow-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Loader className="animate-spin" size={16} />
                      Analyzing...
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAnalyze(report._id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition shadow-md"
                    >
                      Analyze Now
                    </button>
                  )}
                </div>

                {/* Secondary Actions - UPDATED with stopPropagation */}
                <div
                  className="flex gap-2 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(report)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium cursor-pointer text-gray-700 flex items-center justify-center gap-1"
                    title="Edit Report"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(report._id, report.reportFile.fileName)
                    }
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium cursor-pointer text-gray-700 flex items-center justify-center gap-1"
                    title="Download"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(report._id, report.reportType)}
                    disabled={deleting === report._id}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    title="Delete"
                  >
                    {deleting === report._id ? (
                      <Loader className="animate-spin text-red-600" size={14} />
                    ) : (
                      <Trash2 size={14} className="text-red-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Report</h3>
              <button
                onClick={() => setEditingReport(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={editData.reportType}
                  onChange={(e) =>
                    setEditData({ ...editData, reportType: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={editData.hospitalName}
                  onChange={(e) =>
                    setEditData({ ...editData, hospitalName: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter hospital name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={editData.doctorName}
                  onChange={(e) =>
                    setEditData({ ...editData, doctorName: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter doctor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  rows="3"
                  placeholder="Add any notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={() => setEditingReport(null)}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberReports;
