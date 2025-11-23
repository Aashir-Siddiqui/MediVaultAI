import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFamily, deleteFamilyMember } from "../store/familySlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Plus,
  FileText,
  Users,
  Edit,
  Trash2,
  Activity,
  Heart,
  AlertCircle,
  Phone,
  Calendar,
  Droplet,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import AddFamilyModal from "../components/AddFamilyModal";
import EditFamilyModal from "../components/EditFamilyModal";
import toast from "react-hot-toast";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { members, loading } = useSelector((state) => state.family);
  const { user } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    totalReports: 0,
    analyzedReports: 0,
    pendingAnalysis: 0,
    healthScore: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchFamily());
    fetchDashboardStats();
  }, [dispatch]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get("/reports/stats");

      if (response.data.success) {
        const { totalReports, analyzedReports, pendingAnalysis } =
          response.data.stats;

        // Calculate health score based on analyzed reports
        let healthScore = null;
        if (totalReports > 0) {
          const analysisRate = (analyzedReports / totalReports) * 100;
          healthScore = Math.round(analysisRate);
        }

        setStats({
          totalReports,
          analyzedReports,
          pendingAnalysis,
          healthScore,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name}'s profile? This will also delete all their medical reports.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      await dispatch(deleteFamilyMember(id)).unwrap();
      // Refresh stats after deletion
      fetchDashboardStats();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewReports = (memberId) => {
    navigate(`/reports/${memberId}`);
  };

  // Health score color
  const getHealthScoreColor = (score) => {
    if (score === null) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-teal-100 text-lg">
                Manage your family's health records securely in one place
              </p>
            </div>
            <Link
              to="/upload"
              className="bg-white text-teal-700 px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 font-semibold group"
            >
              <FileText
                size={22}
                className="group-hover:rotate-12 transition-transform"
              />
              Upload Report
            </Link>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {/* Family Members */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/25 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-teal-100 text-sm">Family Members</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
              </div>
            </div>

            {/* Total Reports */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/25 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-teal-100 text-sm">Total Reports</p>
                  {statsLoading ? (
                    <div className="w-12 h-7 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">{stats.totalReports}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Analyzed */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/25 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-teal-100 text-sm">Analyzed</p>
                  {statsLoading ? (
                    <div className="w-12 h-7 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats.analyzedReports}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/25 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-teal-100 text-sm">Health Score</p>
                  {statsLoading ? (
                    <div className="w-12 h-7 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {stats.healthScore !== null
                          ? `${stats.healthScore}%`
                          : "--"}
                      </p>
                      {stats.healthScore !== null && (
                        <div
                          className={`w-2 h-2 rounded-full ${getHealthScoreColor(
                            stats.healthScore
                          )}`}
                        ></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {!statsLoading && stats.pendingAnalysis > 0 && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-100" />
              <p className="text-sm text-yellow-100">
                You have <strong>{stats.pendingAnalysis}</strong> report
                {stats.pendingAnalysis > 1 ? "s" : ""} pending analysis
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Family Members Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="text-teal-600" size={24} />
              </div>
              Family Members
            </h2>
            <p className="text-gray-500 mt-1 ml-13">
              Manage your family's health profiles
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition text-sm font-semibold flex items-center gap-2 shadow-lg shadow-teal-200"
          >
            <Plus size={18} /> Add Member
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
              <Heart
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-600"
                size={24}
              />
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-teal-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Family Members Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first family member profile
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition font-semibold inline-flex items-center gap-2"
            >
              <Plus size={20} /> Add First Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Card Header with Profile Image */}
                <div className="relative h-32 bg-gradient-to-br from-teal-500 to-cyan-600 p-6">
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-3xl font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member._id, member.name)}
                      disabled={deletingId === member._id}
                      className="w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-red-500 rounded-lg flex items-center justify-center text-white transition disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === member._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="pt-16 px-6 pb-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {member.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-200">
                      {member.relation}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        Age
                      </span>
                      <span className="font-semibold text-gray-800">
                        {member.age || "N/A"} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Droplet size={16} className="text-red-400" />
                        Blood Group
                      </span>
                      <span className="font-semibold text-gray-800">
                        {member.bloodGroup || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        Emergency
                      </span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {member.emergencyContact}
                      </span>
                    </div>
                  </div>

                  {/* Alerts */}
                  {(member.allergies?.length > 0 ||
                    member.chronicConditions?.length > 0) && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                      {member.allergies?.length > 0 && (
                        <div className="flex items-start gap-2 text-xs mb-2">
                          <AlertCircle
                            size={14}
                            className="text-orange-500 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-orange-700">
                              Allergies:
                            </span>
                            <span className="text-orange-600 ml-1">
                              {member.allergies.slice(0, 2).join(", ")}
                            </span>
                            {member.allergies.length > 2 && (
                              <span className="text-orange-500">
                                {" "}
                                +{member.allergies.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {member.chronicConditions?.length > 0 && (
                        <div className="flex items-start gap-2 text-xs">
                          <Activity
                            size={14}
                            className="text-red-500 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-red-700">
                              Conditions:
                            </span>
                            <span className="text-red-600 ml-1">
                              {member.chronicConditions.slice(0, 2).join(", ")}
                            </span>
                            {member.chronicConditions.length > 2 && (
                              <span className="text-red-500">
                                {" "}
                                +{member.chronicConditions.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewReports(member._id)}
                    className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100 text-gray-700 hover:text-teal-700 py-3 rounded-xl text-sm font-semibold transition-all border border-gray-200 hover:border-teal-200 flex items-center justify-center gap-2 group"
                  >
                    <FileText
                      size={16}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    View Medical Records
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/30 transition-all min-h-[400px] group"
            >
              <div className="w-16 h-16 bg-gray-200 group-hover:bg-teal-100 rounded-full flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                <Plus
                  size={32}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </div>
              <span className="font-semibold text-lg">Add New Member</span>
              <span className="text-sm mt-1">Create a health profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddFamilyModal onClose={() => setShowAddModal(false)} />
      )}
      {editingMember && (
        <EditFamilyModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
