import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateFamilyMember,
  uploadFamilyMemberImage,
} from "../store/familySlice";
import {
  X,
  User,
  Phone,
  Calendar,
  HeartPulse,
  AlertCircle,
  Loader,
  Camera,
  Activity,
  Droplet,
  Users,
} from "lucide-react";

const EditFamilyModal = ({ member, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.family);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: member.name || "",
    relation: member.relation || "Self",
    dateOfBirth: member.dateOfBirth
      ? new Date(member.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: member.gender || "Male",
    bloodGroup: member.bloodGroup || "",
    emergencyContact: member.emergencyContact || "",
    allergies: member.allergies?.join(", ") || "",
    chronicConditions: member.chronicConditions?.join(", ") || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await dispatch(
        uploadFamilyMemberImage({ id: member._id, file })
      ).unwrap();
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      name: formData.name.trim(),
      relation: formData.relation,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup || undefined,
      emergencyContact: formData.emergencyContact.trim(),
      allergies: formData.allergies
        ? formData.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      chronicConditions: formData.chronicConditions
        ? formData.chronicConditions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    try {
      await dispatch(
        updateFamilyMember({ id: member._id, memberData: submitData })
      ).unwrap();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 p-6 sm:p-8">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <Users size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold">Edit Family Member</h2>
              </div>
              <p className="text-teal-100 text-sm ml-14">
                Update patient information and medical history
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 cursor-pointer hover:bg-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Image Section */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-b-2 border-teal-100">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-teal-100 to-cyan-100">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-4xl font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-3 rounded-xl cursor-pointer hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95">
                  {uploading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Camera size={18} />
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {member.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {member.relation}
                  </span>
                  <span className="text-sm">•</span>
                  <span className="text-sm font-medium">
                    {member.age} years old
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Camera size={14} />
                  Click camera icon to update profile photo
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b-2 border-teal-100">
                <User size={20} className="text-teal-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-800"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="relation"
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white appearance-none text-gray-800 font-medium"
                    value={formData.relation}
                    onChange={handleChange}
                  >
                    <option value="Self">Self</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vitals Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b-2 border-teal-100">
                <Activity size={20} className="text-teal-600" />
                Vital Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors"
                      size={18}
                    />
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white text-gray-800"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white appearance-none text-gray-800 font-medium"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Droplet size={14} className="text-red-500" />
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white appearance-none text-gray-800 font-medium"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b-2 border-teal-100">
                <Phone size={20} className="text-teal-600" />
                Emergency Contact
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="emergencyContact"
                    required
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white text-gray-800"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200/50 shadow-inner">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <HeartPulse className="text-red-500" size={22} />
                Medical History
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-orange-500" />
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    className="w-full px-4 py-3.5 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white text-gray-800"
                    placeholder="Separate with commas"
                    value={formData.allergies}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Activity size={14} className="text-red-500" />
                    Chronic Conditions
                  </label>
                  <input
                    type="text"
                    name="chronicConditions"
                    className="w-full px-4 py-3.5 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white text-gray-800"
                    placeholder="Separate with commas"
                    value={formData.chronicConditions}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons - Fixed */}
        <div className="border-t border-gray-200 p-6 sm:p-8 bg-gray-50">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3.5 cursor-pointer rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-white hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={22} />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Member"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFamilyModal;
