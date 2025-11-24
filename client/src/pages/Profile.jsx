// Profile.jsx - FIXED VALIDATION & ADD DELETE ACCOUNT
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLocalUser, logoutUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Mail,
  Calendar,
  Droplet,
  Shield,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        bloodGroup: user.bloodGroup || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size should be less than 5MB");
    }

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
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (
      !window.confirm("Are you sure you want to remove your profile picture?")
    )
      return;

    setDeleting(true);
    try {
      await api.delete("/user/profile-picture");
      dispatch(updateLocalUser({ profilePicture: { url: "", publicId: "" } }));
      toast.success("Profile picture removed!");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ FIXED: Send empty strings instead of undefined for optional fields
      const cleanedData = {
        name: formData.name || "",
        phone: formData.phone || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        bloodGroup: formData.bloodGroup || "",
        address: formData.address || "",
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "",
      };

      const { data } = await api.put("/user/profile", cleanedData);
      dispatch(updateLocalUser(data.user));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passData.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    const hasUppercase = /[A-Z]/.test(passData.newPassword);
    const hasNumber = /\d/.test(passData.newPassword);
    const hasSpecial = /[@$!%*?&]/.test(passData.newPassword);

    if (!hasUppercase || !hasNumber || !hasSpecial) {
      return toast.error(
        "Password must include uppercase, number & special character"
      );
    }

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

  // ✅ NEW: Delete Account Function
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      return toast.error("Please enter your password");
    }

    if (confirmDelete !== "DELETE") {
      return toast.error("Please type DELETE to confirm");
    }

    setDeleting(true);
    try {
      await api.delete("/user/delete-account", {
        data: { password: deletePassword },
      });

      toast.success("Account deleted successfully");

      // Logout and redirect
      dispatch(logoutUser());
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition font-medium"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-teal-100">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-100 bg-gray-100 shadow-lg">
                {user?.profilePicture?.url ? (
                  <img
                    src={user.profilePicture.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                    <User className="text-white" size={48} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-teal-700 transition shadow-lg">
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
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            {user?.profilePicture?.url && (
              <button
                onClick={handleImageDelete}
                disabled={deleting}
                className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 mx-auto disabled:opacity-50"
              >
                {deleting ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Remove Photo
              </button>
            )}
          </div>

          {/* Navigation */}
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
              <Lock size={20} /> Change Password
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition ${
                activeTab === "danger"
                  ? "bg-red-50 text-red-700 font-semibold border-l-4 border-red-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle size={20} /> Danger Zone
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {activeTab === "details" ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
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
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      <input
                        type="date"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <div className="relative">
                      <Droplet
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      <select
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.bloodGroup}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bloodGroup: e.target.value,
                          })
                        }
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : activeTab === "password" ? (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <Shield className="text-teal-600" size={28} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Change Password
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Keep your account secure
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={passData.currentPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="Min 8 chars, uppercase, number, special char"
                      value={passData.newPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Must include: uppercase, number & special character
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // ✅ NEW: Danger Zone Tab
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200">
                  <AlertTriangle className="text-red-600" size={28} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Danger Zone
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Irreversible and destructive actions
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-red-900 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-red-700 text-sm mb-4">
                    Once you delete your account, there is no going back. All
                    your family members, reports, and data will be permanently
                    deleted.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle size={32} />
              <h3 className="text-2xl font-bold text-gray-800">
                Delete Account
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-700">
                This action <strong>cannot be undone</strong>. This will
                permanently delete:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Your account and profile</li>
                <li>All family members</li>
                <li>All medical reports</li>
                <li>All analysis data</li>
              </ul>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    DELETE
                  </span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleting || !deletePassword || confirmDelete !== "DELETE"
                }
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Forever
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setConfirmDelete("");
                }}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
