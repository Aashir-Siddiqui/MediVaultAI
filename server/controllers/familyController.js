import FamilyMember from "../models/FamilyMembers.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const addFamilyMember = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      relation,
      dateOfBirth,
      gender,
      bloodGroup,
      allergies,
      chronicConditions,
      emergencyContact,
    } = req.body;

    // Check if Self relation already exists
    if (relation === "Self") {
      const existingSelf = await FamilyMember.findOne({
        userId,
        relation: "Self",
      });
      if (existingSelf) {
        return res.status(400).json({
          success: false,
          message:
            "Self profile already exists. You can only have one Self profile.",
        });
      }
    }

    const familyMember = await FamilyMember.create({
      userId,
      name,
      relation,
      dateOfBirth,
      gender,
      bloodGroup,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      emergencyContact,
    });

    return res.status(201).json({
      success: true,
      message: "Family member added successfully",
      familyMember,
    });
  } catch (error) {
    console.error("Add family member error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllFamilyMembers = async (req, res) => {
  try {
    const userId = req.userId;
    const { relation, gender } = req.query;

    // Build filter
    const filter = { userId };
    if (relation) filter.relation = relation;
    if (gender) filter.gender = gender;

    const familyMembers = await FamilyMember.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Family members retrieved successfully",
      count: familyMembers.length,
      familyMembers,
    });
  } catch (error) {
    console.error("Get all family members error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single family member
export const getFamilyMemberById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Family member retrieved successfully",
      familyMember,
    });
  } catch (error) {
    console.error("Get family member error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update family member
export const updateFamilyMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      name,
      relation,
      dateOfBirth,
      gender,
      bloodGroup,
      allergies,
      chronicConditions,
      emergencyContact,
    } = req.body;

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Check if changing to Self when Self already exists
    if (relation === "Self" && familyMember.relation !== "Self") {
      const existingSelf = await FamilyMember.findOne({
        userId,
        relation: "Self",
        _id: { $ne: id },
      });

      if (existingSelf) {
        return res.status(400).json({
          success: false,
          message:
            "Self profile already exists. You can only have one Self profile.",
        });
      }
    }

    // Update fields
    if (name) familyMember.name = name;
    if (relation) familyMember.relation = relation;
    if (dateOfBirth) familyMember.dateOfBirth = dateOfBirth;
    if (gender) familyMember.gender = gender;
    if (bloodGroup !== undefined) familyMember.bloodGroup = bloodGroup;
    if (allergies !== undefined) familyMember.allergies = allergies;
    if (chronicConditions !== undefined)
      familyMember.chronicConditions = chronicConditions;
    if (emergencyContact) familyMember.emergencyContact = emergencyContact;

    await familyMember.save();

    return res.status(200).json({
      success: true,
      message: "Family member updated successfully",
      familyMember,
    });
  } catch (error) {
    console.error("Update family member error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Upload family member profile image
export const uploadFamilyMemberImage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Delete old image from Cloudinary if exists
    if (familyMember.profileImage) {
      try {
        const publicId = familyMember.profileImage
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(
          `health-records/family-members/${publicId}`
        );
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "health-records/family-members",
      width: 300,
      height: 300,
      crop: "fill",
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    // Update family member profile image
    familyMember.profileImage = result.secure_url;
    await familyMember.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: familyMember.profileImage,
    });
  } catch (error) {
    console.error("Upload family member image error:", error);

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

// Delete family member profile image
export const deleteFamilyMemberImage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    if (!familyMember.profileImage) {
      return res.status(400).json({
        success: false,
        message: "No profile image to delete",
      });
    }

    // Delete from Cloudinary
    try {
      const publicId = familyMember.profileImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `health-records/family-members/${publicId}`
      );
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }

    // Remove from database
    familyMember.profileImage = null;
    await familyMember.save();

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Delete family member image error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete family member
export const deleteFamilyMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Delete profile image from Cloudinary if exists
    if (familyMember.profileImage) {
      try {
        const publicId = familyMember.profileImage
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(
          `health-records/family-members/${publicId}`
        );
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await FamilyMember.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Family member deleted successfully",
    });
  } catch (error) {
    console.error("Delete family member error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get family member statistics
export const getFamilyMemberStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    const stats = {
      name: familyMember.name,
      relation: familyMember.relation,
      age: calculateAge(familyMember.dateOfBirth),
      reportsCount: 0,
      lastReportDate: null,
      hasAllergies: familyMember.allergies.length > 0,
      hasChronicConditions: familyMember.chronicConditions.length > 0,
    };

    return res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Get family member stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper function to calculate age
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
