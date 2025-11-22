import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFamily } from "../store/familySlice";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { REPORT_TYPES } from "../utils/constant";
import { UploadCloud, X, Loader, FileText, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const UploadReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { members } = useSelector((state) => state.family);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    familyMemberId: location.state?.selectedMember || "",
    reportType: REPORT_TYPES[0],
    reportDate: new Date().toISOString().split("T")[0],
    hospitalName: "",
    doctorName: "",
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchFamily());
  }, [dispatch]);

  // Auto-select first member if none selected
  useEffect(() => {
    if (members.length > 0 && !formData.familyMemberId) {
      setFormData((prev) => ({ ...prev, familyMemberId: members[0]._id }));
    }
  }, [members, formData.familyMemberId]);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
    } else {
      toast.error("Please drop a valid image file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      return toast.error("Please select a report image");
    }

    if (!formData.familyMemberId) {
      return toast.error("Please select a family member");
    }

    setLoading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append("reportFile", file);
    data.append("familyMemberId", formData.familyMemberId);
    data.append("reportType", formData.reportType);
    data.append("reportDate", formData.reportDate);
    data.append("hospitalName", formData.hospitalName || "");
    data.append("doctorName", formData.doctorName || "");
    data.append("notes", formData.notes || "");

    try {
      const response = await api.post("/reports/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      toast.success("Report uploaded successfully!");

      // Navigate to reports page for that member
      setTimeout(() => {
        navigate(`/reports/${formData.familyMemberId}`);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload report");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <UploadCloud size={28} />
              </div>
              <h2 className="text-3xl font-bold">Upload Medical Report</h2>
            </div>
            <p className="text-teal-100 text-lg">
              AI will extract data and provide detailed analysis
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Member and Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Family Member <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                value={formData.familyMemberId}
                onChange={(e) =>
                  setFormData({ ...formData, familyMemberId: e.target.value })
                }
              >
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.relation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                value={formData.reportType}
                onChange={(e) =>
                  setFormData({ ...formData, reportType: e.target.value })
                }
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Report Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              value={formData.reportDate}
              onChange={(e) =>
                setFormData({ ...formData, reportDate: e.target.value })
              }
            />
          </div>

          {/* Optional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hospital Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. City General Hospital"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.hospitalName}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Smith"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.doctorName}
                onChange={(e) =>
                  setFormData({ ...formData, doctorName: e.target.value })
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="Any additional notes about this report..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            ></textarea>
          </div>

          {/* File Drop Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Report Image <span className="text-red-500">*</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center transition hover:bg-gray-50 hover:border-teal-400 relative group"
            >
              {preview ? (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-80 rounded-xl shadow-lg object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition"
                  >
                    <X size={20} />
                  </button>
                  <div className="mt-4 text-sm text-gray-600">
                    <CheckCircle
                      className="inline text-green-500 mr-2"
                      size={16}
                    />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("fileUpload").click()}
                  className="cursor-pointer py-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={40} />
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: JPG, PNG, GIF (Max 10MB)
                  </p>
                </div>
              )}
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-teal-800">
                  Uploading...
                </span>
                <span className="text-sm font-bold text-teal-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-teal-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={22} />
                Uploading Report...
              </>
            ) : (
              <>
                <FileText size={22} />
                Upload Report
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500">
            Your report will be securely uploaded and ready for AI analysis
          </p>
        </form>
      </div>
    </div>
  );
};

export default UploadReport;
