import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFamilyMember } from "../store/familySlice";
import {
  X,
  User,
  Phone,
  Calendar,
  Activity,
  HeartPulse,
  AlertCircle,
  Loader,
} from "lucide-react";

const AddFamilyModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.family);

  const [formData, setFormData] = useState({
    name: "",
    relation: "Self",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "",
    emergencyContact: "",
    allergies: "",
    chronicConditions: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data: Convert comma-separated strings to arrays
    const submitData = {
      name: formData.name.trim(),
      relation: formData.relation,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup || undefined, // Send undefined if empty
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

    console.log("Submitting family member data:", submitData);

    try {
      await dispatch(addFamilyMember(submitData)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 p-6 flex justify-between items-center z-10 rounded-t-2xl">
          <div className="text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User size={28} />
              Add Family Member
            </h2>
            <p className="text-teal-100 text-sm mt-1">
              Enter patient details for health tracking
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Relation <span className="text-red-500">*</span>
              </label>
              <select
                name="relation"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50 focus:bg-white"
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
              <div className="relative">
                <Calendar
                  className="absolute left-3.5 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50 focus:bg-white"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50 focus:bg-white"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50 focus:bg-white"
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
                pattern="[0-9+\-\s\(\)]+"
                className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50 focus:bg-white"
                placeholder="+92 300 1234567"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: +92 300 1234567 or 03001234567
            </p>
          </div>

          {/* Medical History */}
          <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <HeartPulse className="text-red-500" size={20} />
              Medical History (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <AlertCircle size={14} className="text-orange-500" />{" "}
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  placeholder="e.g. Peanuts, Dust, Penicillin"
                  value={formData.allergies}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple with commas
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Activity size={14} className="text-red-500" /> Chronic
                  Conditions
                </label>
                <input
                  type="text"
                  name="chronicConditions"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  placeholder="e.g. Diabetes, Hypertension"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple with commas
                </p>
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
              className="w-2/3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                "Save Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyModal;
