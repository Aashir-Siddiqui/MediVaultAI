import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import {
  KeyRound,
  Loader,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Send Reset OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/send-reset-otp", { email });
      toast.success("Reset code sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    setResending(true);
    try {
      await api.post("/auth/send-reset-otp", { email });
      toast.success("New reset code sent");
      setOtp(""); // Clear OTP field
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify Reset OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return toast.error("Please enter a 6-digit code");
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-reset-otp", { email, otp });
      toast.success("Code verified! Now set your new password");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password (Only after OTP is verified)
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    // Check password strength
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[@$!%*?&]/.test(newPassword);

    if (!hasUppercase || !hasNumber || !hasSpecial) {
      return toast.error(
        "Password must include uppercase, number & special character"
      );
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful!");

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Password changed! Please login with new password.",
          },
        });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            {step === 3 ? (
              <CheckCircle className="text-teal-600" size={32} />
            ) : (
              <KeyRound className="text-teal-600" size={32} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && "Reset Password"}
            {step === 2 && "Verify Reset Code"}
            {step === 3 && "Create New Password"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Choose a strong new password"}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-between mb-8">
          <div
            className={`flex-1 h-2 rounded-full ${
              step >= 1 ? "bg-teal-600" : "bg-gray-200"
            } transition-all`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full mx-2 ${
              step >= 2 ? "bg-teal-600" : "bg-gray-200"
            } transition-all`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full ${
              step >= 3 ? "bg-teal-600" : "bg-gray-200"
            } transition-all`}
          ></div>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 cursor-pointer text-white py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition shadow-lg shadow-teal-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                className="w-full text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-xl p-4 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-gray-500 text-center mt-3">
                Code sent to <span className="font-semibold">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full cursor-pointer bg-teal-600 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition shadow-lg shadow-teal-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            {/* Resend Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-teal-600 cursor-pointer hover:text-teal-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="w-full text-gray-600 cursor-pointer text-sm hover:text-gray-800 transition"
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-5 animate-fadeIn"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Min 8 chars, 1 uppercase, 1 number, 1 special char
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-black transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-6 cursor-pointer text-gray-500 text-sm hover:text-gray-800 transition font-medium"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
