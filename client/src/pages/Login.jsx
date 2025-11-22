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
} from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Show verification success message if coming from verify-email
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Redirect if already authenticated
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

      // Check if user is verified
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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding & Image */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden text-white p-12 flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Activity size={32} />
            </div>
            <h1 className="text-3xl font-bold">MediVault AI</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Smart Healthcare <br /> Management
          </h2>
          <p className="text-teal-100 text-lg max-w-md">
            Store your family's medical records securely and get AI-powered
            insights instantly.
          </p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10 text-sm text-teal-200">
          © 2025 HealthAI Systems. Secure & Encrypted.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Email Verification Notice */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle
              className="text-amber-600 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-xs text-amber-800">
              <strong>First time?</strong> You must verify your email before
              logging in.
            </p>
          </div>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-teal-600 font-bold hover:underline hover:text-teal-700"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
