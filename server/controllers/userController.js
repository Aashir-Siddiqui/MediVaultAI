import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import MedicalReport from "../models/MedicalReport.js";
import FamilyMember from "../models/FamilyMembers.js";

// Get user data (profile)
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Log incoming data
    console.log("Update Profile Request:", {
      userId,
      body: req.body,
    });

    const {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      city,
      state,
      country,
      zipCode,
      emergencyContact,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields only if they are provided (not undefined)
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (zipCode !== undefined) user.zipCode = zipCode;

    if (emergencyContact !== undefined) {
      user.emergencyContact = {
        name: emergencyContact.name || user.emergencyContact?.name || "",
        relationship:
          emergencyContact.relationship ||
          user.emergencyContact?.relationship ||
          "",
        phone: emergencyContact.phone || user.emergencyContact?.phone || "",
      };
    }

    await user.save();

    const updatedUser = await User.findById(userId).select(
      "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt"
    );

    console.log("Profile updated successfully:", updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture && user.profilePicture.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "health-records/profile-pictures",
      width: 300,
      height: 300,
      crop: "fill",
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    // Update user profile picture
    user.profilePicture = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);

    // Delete temporary file if exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.profilePicture || !user.profilePicture.publicId) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to delete",
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.profilePicture.publicId);

    // Remove from database
    user.profilePicture = {
      url: "",
      publicId: "",
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile picture error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    console.log("🗑️ Starting account deletion for user:", userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    //1. Delete user's profile picture from Cloudinary
    if (user.profilePicture && user.profilePicture.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
        console.log("User profile picture deleted");
      } catch (error) {
        console.error("Error deleting user profile picture:", error);
      }
    }

    // 2. Find all family members
    const familyMembers = await FamilyMember.find({ userId });
    console.log(`Found ${familyMembers.length} family members`);

    // 3. Delete family member profile images
    for (const member of familyMembers) {
      if (member.profileImage) {
        try {
          // Extract public_id from URL or use stored value
          const publicId = member.profileImage
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted profile image for ${member.name}`);
        } catch (error) {
          console.error(`Error deleting image for ${member.name}:`, error);
        }
      }
    }

    // 4. Find all medical reports
    const reports = await MedicalReport.find({ userId });
    console.log(`Found ${reports.length} medical reports`);

    // 5. Delete all report files from Cloudinary
    for (const report of reports) {
      if (report.reportFile && report.reportFile.publicId) {
        try {
          await cloudinary.uploader.destroy(report.reportFile.publicId, {
            resource_type: "image",
          });
          console.log(`Deleted report file: ${report.reportType}`);
        } catch (error) {
          console.error(`Error deleting report file:`, error);
        }
      }
    }

    // 6. Delete all medical reports from database
    const deletedReports = await MedicalReport.deleteMany({ userId });
    console.log(`Deleted ${deletedReports.deletedCount} medical reports`);

    // 7. Delete all family members from database
    const deletedMembers = await FamilyMember.deleteMany({ userId });
    console.log(`Deleted ${deletedMembers.deletedCount} family members`);

    // 8. Delete user account
    await User.findByIdAndDelete(userId);
    console.log("User account deleted");

    //9. Clear cookie
    res.clearCookie(process.env.COOKIE_NAME);

    console.log("Account deletion completed successfully");

    return res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully",
      deleted: {
        familyMembers: deletedMembers.deletedCount,
        reports: deletedReports.deletedCount,
      },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get account statistics
export const getAccountStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // TODO: Get counts from other collections when models are created
    // For now, returning basic stats
    const stats = {
      accountCreated: user.createdAt,
      isVerified: user.isVerified,
      familyMembersCount: 0, // Will be updated later
      reportsCount: 0, // Will be updated later
      lastLogin: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Account statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Get account stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
