import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
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
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const MemberReports = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    reportType: "",
    startDate: "",
    endDate: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMemberAndReports();
  }, [memberId]);

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
      const { data } = await api.get(`/reports/${reportId}/download`);
      window.open(data.file.url, "_blank");
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.reportType) {
      filtered = filtered.filter((r) => r.reportType === filters.reportType);
    }
    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
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
          className="text-teal-600 hover:underline"
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
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-teal-200 bg-gradient-to-br from-teal-400 to-cyan-500">
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {member.name}'s Medical Records
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  {member.relation}
                </span>
                <span>{member.age} years</span>
                {member.bloodGroup && <span>Blood: {member.bloodGroup}</span>}
              </div>
            </div>
          </div>

          <Link
            to="/upload"
            state={{ selectedMember: member._id }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition font-semibold"
          >
            <Upload size={20} />
            Upload New Report
          </Link>
        </div>
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
              placeholder="Search reports by type, hospital, or doctor..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-5 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-medium"
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
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                value={filters.reportType}
                onChange={(e) =>
                  setFilters({ ...filters, reportType: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="Blood Test">Blood Test</option>
                <option value="X-Ray">X-Ray</option>
                <option value="MRI Scan">MRI Scan</option>
                <option value="CT Scan">CT Scan</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="Uploaded">Uploaded</option>
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
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
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
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Reports List */}
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
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition font-semibold"
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
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
            >
              {/* Report Image Preview */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={report.reportFile.url}
                  alt={report.reportType}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      report.status === "Analyzed"
                        ? "bg-green-500 text-white"
                        : report.status === "Processing"
                        ? "bg-yellow-500 text-white"
                        : report.status === "Failed"
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Report Details */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {report.reportType}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {new Date(report.reportDate).toLocaleDateString()}
                    </span>
                  </div>
                  {report.hospitalName && (
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      <span className="truncate">{report.hospitalName}</span>
                    </div>
                  )}
                  {report.doctorName && (
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} className="text-gray-400" />
                      <span className="truncate">Dr. {report.doctorName}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {report.aiAnalysis?.isAnalyzed ? (
                    <Link
                      to={`/analysis/${report._id}`}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View Analysis
                    </Link>
                  ) : report.status === "Processing" ? (
                    <button
                      disabled
                      className="flex-1 bg-yellow-100 text-yellow-700 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Loader className="animate-spin" size={16} />
                      Processing...
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/analysis/${report._id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                      Analyze Now
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleDownload(report._id, report.reportFile.fileName)
                    }
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    title="Download"
                  >
                    <Download size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(report._id, report.reportType)}
                    disabled={deleting === report._id}
                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === report._id ? (
                      <Loader className="animate-spin text-red-600" size={16} />
                    ) : (
                      <Trash2 size={16} className="text-red-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberReports;
