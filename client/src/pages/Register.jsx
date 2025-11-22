import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { User, Mail, Lock, Loader, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[@$!%*?&]/.test(formData.password);

    if (!hasUppercase || !hasNumber || !hasSpecial) {
      return toast.error(
        "Password must include uppercase, number & special character"
      );
    }

    setIsLoading(true);
    try {
      // Register without using Redux (to prevent auto-login)
      await api.post("/auth/register", formData);

      toast.success("Registration successful! Please verify your email.");

      // Navigate to verify email page with email in state
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (error) {
      console.error("Registration failed", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 order-2 md:order-1">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">
              Start managing your family health today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-600 transition"
                  size={20}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition outline-none bg-gray-50 focus:bg-white"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-600 transition"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition outline-none bg-gray-50 focus:bg-white"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-600 transition"
                  size={20}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition outline-none bg-gray-50 focus:bg-white"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <ShieldCheck size={14} /> Min 8 chars, 1 uppercase, 1 number & 1
                special char
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-bold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Right Side - Visual */}
        <div className="w-full md:w-1/2 bg-gray-900 order-1 md:order-2 relative overflow-hidden p-12 text-white flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 to-teal-800/50"></div>

          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">
              Your Health Journey Starts Here
            </h3>
            <ul className="space-y-4 text-teal-100">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300">
                  1
                </div>
                <span>Securely store medical reports</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300">
                  2
                </div>
                <span>AI analysis of lab results</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300">
                  3
                </div>
                <span>Track family health history</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
