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
const cookieExpires = process.env.COOKIE_EXPIRES;
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

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie(cookieName, token, cookieOptions);

    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: "Welcome to Our Service!",
      text: `Hello ${name},\n\nThank you for registering ${email} at our service.\n\nBest regards,\nTeam`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie(cookieName, token, cookieOptions);

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
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
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = Date.now() + 10 * 60 * 1000;
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpireAt;
    await user.save();
    const mailOptions = {
      from: senderEmail,
      to: user.email,
      subject: "Your Verification OTP",
      text: `Hello ${user.name},\n\nYour OTP for email verification is: ${otp}\nIt will expire in 10 minutes.\n\nBest regards,\nTeam`,
    };
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
