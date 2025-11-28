import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { LogOut, Activity, UserCircle, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              MediVault<span className="text-teal-600">AI</span>
            </span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
            >
              {user.profilePicture?.url ? (
                <img
                  src={user.profilePicture.url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <UserCircle className="text-gray-500" size={32} />
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 leading-none">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 mt-1">My Profile</p>
              </div>
            </Link>

            <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition text-sm px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
