import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLocalUser } from "../store/authSlice";
import api from "../api/axios";
import {
  User,
  Phone,
  MapPin,
  Camera,
  Lock,
  Save,
  Loader,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("details"); // details | password
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  // Password Form State
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
      });
    }
  }, [user]);

  // Handle Profile Picture Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploading(true);
    try {
      const { data } = await api.post("/user/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(updateLocalUser({ profilePicture: data.profilePicture }));
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Handle Profile Details Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/user/profile", formData);
      dispatch(updateLocalUser(data.user));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/user/change-password", passData);
      toast.success("Password changed successfully!");
      setPassData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Account Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Navigation */}
        <div className="space-y-6">
          {/* Profile Image Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-50 bg-gray-100">
                {user?.profilePicture?.url ? (
                  <img
                    src={user.profilePicture.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-6 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition shadow-lg">
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
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setActiveTab("details")}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition ${
                activeTab === "details"
                  ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <User size={20} /> Personal Details
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition ${
                activeTab === "password"
                  ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Lock size={20} /> Security & Password
            </button>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {activeTab === "details" ? (
              <form
                onSubmit={handleProfileUpdate}
                className="space-y-6 animate-fadeIn"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Street Address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}{" "}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handlePasswordChange}
                className="space-y-6 animate-fadeIn"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Change Password
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    value={passData.currentPassword}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Min 8 characters, 1 uppercase, 1 number"
                    value={passData.newPassword}
                    onChange={(e) =>
                      setPassData({ ...passData, newPassword: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}{" "}
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
