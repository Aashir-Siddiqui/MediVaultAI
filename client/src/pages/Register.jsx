import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import {
  User,
  Mail,
  Lock,
  Loader,
  ShieldCheck,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  Heart,
  FileText,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[@$!%*?&]/.test(formData.password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

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
      await api.post("/auth/register", formData);
      toast.success("Registration successful! Please verify your email.");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (error) {
      console.error("Registration failed", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Enter password";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 gap-8">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 max-w-xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-teal-600 p-2.5 rounded-xl">
              <Activity size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MediVault AI</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 sm:p-10 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                Create Account
              </h2>
              <p className="text-gray-500">
                Start managing your family health today
              </p>
            </div>

            <div className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors duration-200"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

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
                    placeholder="you@example.com"
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? getStrengthColor()
                              : "bg-gray-200"
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Password strength:{" "}
                      <span className="font-semibold">{getStrengthText()}</span>
                    </p>
                  </div>
                )}

                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-teal-600" />
                    Password Requirements:
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          formData.password.length >= 8
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          /[A-Z]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          /[0-9]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          /[@$!%*?&]/.test(formData.password)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="cursor-pointer w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={22} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="w-full lg:w-1/2 max-w-xl">
          <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 rounded-3xl shadow-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              {/* Logo & Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-xl border border-white/30">
                  <Activity size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">MediVault AI</h1>
                  <p className="text-teal-200 text-sm">Healthcare Simplified</p>
                </div>
              </div>

              <h3 className="text-4xl font-bold mb-4 leading-tight">
                Your Health Journey
                <br />
                Starts Here
              </h3>

              <p className="text-teal-100 mb-8 text-lg">
                Join thousands of families managing their health records with
                AI-powered insights.
              </p>

              {/* Features List */}
              <div className="space-y-5">
                {[
                  {
                    icon: FileText,
                    title: "Secure Record Storage",
                    desc: "Keep all medical documents in one encrypted place",
                  },
                  {
                    icon: Brain,
                    title: "AI Health Analysis",
                    desc: "Get instant insights from your lab reports",
                  },
                  {
                    icon: Heart,
                    title: "Family Health Tracking",
                    desc: "Monitor health history for your entire family",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="bg-teal-400/30 p-3 rounded-xl flex-shrink-0">
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1 text-lg">
                        {feature.title}
                      </h4>
                      <p className="text-teal-100 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2
                  size={24}
                  className="text-green-300 flex-shrink-0"
                />
                <p className="text-sm text-teal-100">
                  <span className="font-semibold text-white">
                    Trusted by families
                  </span>{" "}
                  for secure health management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
