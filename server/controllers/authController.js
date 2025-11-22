import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import transporter from "../config/nodemailer.js";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const cookieName = process.env.COOKIE_NAME;
const isProduction = process.env.NODE_ENV === "production";
const cookieExpires = parseInt(process.env.COOKIE_EXPIRES);
const senderEmail = process.env.SENDER_EMAIL;
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: cookieExpires,
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create token and set cookie for OTP verification process
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie(cookieName, token, cookieOptions);

    // Send welcome email (not OTP yet - that's sent separately)
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: "Welcome to MediVault AI!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">Welcome to MediVault AI, ${name}!</h2>
          <p>Thank you for registering your account.</p>
          <p>Please verify your email address to activate your account and start using our services.</p>
          <p>You will receive a verification code shortly.</p>
          <br/>
          <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        needsVerification: true,
      });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie(cookieName, token, cookieOptions);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie(cookieName, cookieOptions);
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpireAt;
    await user.save();

    const mailOptions = {
      from: senderEmail,
      to: user.email,
      subject: "Email Verification Code - MediVault AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0d9488;">Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f0fdfa; border: 2px solid #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0d9488; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2025 MediVault AI. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Send verify OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired. Please request a new one.",
      });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: senderEmail,
      to: user.email,
      subject: "Email Verified Successfully!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0d9488;">Email Verified! 🎉</h2>
          <p>Hello ${user.name},</p>
          <p>Your email has been successfully verified. You can now log in and start using MediVault AI.</p>
          <p>Welcome aboard!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2025 MediVault AI. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const isAuthenticated = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User is authenticated",
      userId: req.userId,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: "If this email exists, you will receive a reset code",
      });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetOtp = resetOtp;
    user.resetOtpExpireAt = resetOtpExpireAt;
    await user.save();

    const mailOptions = {
      from: senderEmail,
      to: user.email,
      subject: "Password Reset Code - MediVault AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0d9488;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Your reset code is:</p>
          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #f59e0b; font-size: 36px; letter-spacing: 8px; margin: 0;">${resetOtp}</h1>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p><strong>If you didn't request this</strong>, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2025 MediVault AI. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "If this email exists, you will receive a reset code",
    });
  } catch (error) {
    console.error("Send reset OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });

    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });

    if (user.resetOtpExpireAt < Date.now())
      return res.status(400).json({
        success: false,
        message: "Reset code expired. Please request a new one.",
      });

    return res.status(200).json({
      success: true,
      message: "Code verified! You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });

    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });

    if (user.resetOtpExpireAt < Date.now())
      return res.status(400).json({
        success: false,
        message: "Reset code expired. Please start the process again.",
      });

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    const mailOptions = {
      from: senderEmail,
      to: user.email,
      subject: "Password Reset Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0d9488;">Password Changed Successfully</h2>
          <p>Hello ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>You can now log in with your new password.</p>
          <p><strong>If you didn't make this change</strong>, please contact us immediately.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2025 MediVault AI. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
