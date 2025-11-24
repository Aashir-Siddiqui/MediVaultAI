import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFamily } from "../store/familySlice";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { REPORT_TYPES } from "../utils/constant";
import {
  UploadCloud,
  X,
  Loader,
  FileText,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-0">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 md:mb-6 flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">Back</span>
      </button>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <UploadCloud size={24} className="md:w-7 md:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold mb-1">
                  Upload Medical Report
                </h2>
                <p className="text-teal-100 text-sm md:text-lg flex items-center gap-2">
                  <Sparkles size={16} className="flex-shrink-0" />
                  AI will extract data and provide detailed analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-8 space-y-5 md:space-y-6"
        >
          {/* Member and Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Family Member <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm md:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm md:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm md:text-base"
              value={formData.reportDate}
              onChange={(e) =>
                setFormData({ ...formData, reportDate: e.target.value })
              }
            />
          </div>

          {/* Optional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hospital Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. City General Hospital"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm md:text-base"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm md:text-base"
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
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm md:text-base"
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
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-8 text-center transition hover:bg-gray-50 hover:border-teal-400 relative group"
            >
              {preview ? (
                <div className="relative inline-block w-full">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-60 md:max-h-80 rounded-xl shadow-lg object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition"
                  >
                    <X size={18} />
                  </button>
                  <div className="mt-4 text-xs md:text-sm text-gray-600 px-2">
                    <CheckCircle
                      className="inline text-green-500 mr-2"
                      size={16}
                    />
                    <span className="break-all">{file.name}</span> (
                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("fileUpload").click()}
                  className="cursor-pointer py-6 md:py-8"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} className="md:w-10 md:h-10" />
                  </div>
                  <p className="text-base md:text-xl font-semibold text-gray-700 mb-2">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
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
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Uploading Report...
              </>
            ) : (
              <>
                <FileText size={20} />
                Upload Report
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 px-2">
            Your report will be securely uploaded and ready for AI analysis
          </p>
        </form>
      </div>
    </div>
  );
};

export default UploadReport;
