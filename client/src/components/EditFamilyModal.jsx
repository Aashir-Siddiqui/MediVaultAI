import React, { useState, useEffect } from "react";
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
  Trash2,
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center z-10 rounded-t-2xl">
          <div className="text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User size={28} />
              Edit Family Member
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Update patient information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full text-white transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile Image Section */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {member.profileImage ? (
                  <img
                    src={member.profileImage}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
                {uploading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
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
            <div>
              <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
              <p className="text-gray-600">
                {member.relation} • {member.age} years
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Click camera icon to update photo
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
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

          {/* Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
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

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Emergency Contact <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3.5 top-3.5 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                name="emergencyContact"
                required
                className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Medical History */}
          <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <HeartPulse className="text-red-500" size={20} />
              Medical History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <AlertCircle
                    size={14}
                    className="inline text-orange-500 mr-1"
                  />{" "}
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="Separate with commas"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <HeartPulse size={14} className="inline text-red-500 mr-1" />{" "}
                  Chronic Conditions
                </label>
                <input
                  type="text"
                  name="chronicConditions"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="Separate with commas"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                "Update Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFamilyModal;
