import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader,
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all fields");
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap();

      if (result && !result.isVerified) {
        toast.error("Please verify your email first");
        navigate("/verify-email", { state: { email: formData.email } });
        return;
      }

      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white p-12 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-xl border border-white/30 shadow-2xl">
                <Activity size={36} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  MediVault AI
                </h1>
                <p className="text-teal-200 text-sm">Healthcare Simplified</p>
              </div>
            </div>

            <h2 className="text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
              Smart Healthcare
              <br />
              Management
            </h2>
            <p className="text-teal-100 text-xl max-w-lg leading-relaxed">
              Store your family's medical records securely and get AI-powered
              insights instantly with our advanced healthcare platform.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4">
              {[
                { icon: Sparkles, text: "AI-Powered Health Insights" },
                { icon: Shield, text: "Fully Secure" },
                { icon: Zap, text: "Instant Report Analysis" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="bg-teal-400/20 p-2 rounded-lg">
                    <feature.icon size={24} className="text-teal-200" />
                  </div>
                  <span className="text-white font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-teal-200/80">
            © 2025 HealthAI Systems. All rights reserved.
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-teal-600 p-2.5 rounded-xl">
              <Activity size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MediVault AI</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 sm:p-10 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500">
                Sign in to access your health dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors duration-200"
                    size={20}
                  />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors duration-200"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-800"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={22} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>

            {/* Email Verification Notice */}
            <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle
                className="text-amber-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">First time user?</p>
                <p className="text-amber-800">
                  You must verify your email before logging in.
                </p>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
