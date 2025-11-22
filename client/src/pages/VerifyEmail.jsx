import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { ShieldCheck, Loader, RefreshCw, CheckCircle2 } from "lucide-react";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      toast.error("Please register first");
      navigate("/register");
    }
  }, [email, navigate]);

  // Auto-send OTP when page loads
  useEffect(() => {
    if (email) {
      sendOtpToEmail();
    }
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtpToEmail = async () => {
    try {
      // First login to get the token (required for send-verify-otp endpoint)
      await api.post("/auth/send-verify-otp");
      toast.success("Verification code sent to your email");
      setCountdown(60); // Start 60 second countdown
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit code");
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-account", { otp });

      toast.success("Email verified successfully!");

      // Show success message and redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Account verified! Please login." },
        });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) {
      return toast.error(`Please wait ${countdown} seconds before resending`);
    }

    setResending(true);
    try {
      await api.post("/auth/send-verify-otp");
      toast.success("New code sent to your email");
      setCountdown(60);
      setOtp(""); // Clear current OTP input
    } catch (error) {
      toast.error("Could not resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center mb-6 shadow-md">
            <ShieldCheck className="text-teal-600" size={40} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Verify Your Email
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            We've sent a 6-digit verification code to
            <span className="block font-semibold text-gray-700 mt-1">
              {email}
            </span>
          </p>

          {/* OTP Input Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                className="w-full text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-xl p-4 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition text-gray-800"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-teal-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Verify Account
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw size={16} />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Back to Register */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate("/register")}
              className="w-full text-gray-500 text-sm hover:text-gray-800 transition font-medium"
            >
              ← Back to Registration
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-800 text-center">
            💡 Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
