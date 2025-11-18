// controllers/reportController.js
import MedicalReport from "../models/medicalReport.js";
import FamilyMember from "../models/familyMembers.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// Upload medical report - FIXED
export const uploadReport = async (req, res) => {
  try {
    const userId = req.userId;

    // Log for debugging
    console.log("Upload Report Request:", {
      body: req.body,
      file: req.file
        ? { name: req.file.originalname, size: req.file.size }
        : null,
    });

    const {
      familyMemberId,
      reportType,
      reportDate,
      hospitalName,
      doctorName,
      notes,
      tags,
    } = req.body;

    // Check if file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a report file",
      });
    }

    // Verify family member exists and belongs to user
    const familyMember = await FamilyMember.findOne({
      _id: familyMemberId,
      userId,
    });

    if (!familyMember) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "health-records/medical-reports",
      resource_type: "auto", // Supports images and PDFs
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    // Process tags - multer sends as string, convert to array
    let tagsArray = [];
    if (tags) {
      if (typeof tags === "string") {
        // If comma-separated string, split it
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    // Create medical report
    const medicalReport = await MedicalReport.create({
      userId,
      familyMemberId,
      reportType,
      reportDate: new Date(reportDate),
      hospitalName: hospitalName || "",
      doctorName: doctorName || "",
      notes: notes || "",
      tags: tagsArray,
      reportFile: {
        url: result.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        publicId: result.public_id,
      },
      status: "Uploaded",
    });

    // Populate family member info
    await medicalReport.populate("familyMemberId", "name relation");

    return res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report: medicalReport,
    });
  } catch (error) {
    console.error("Upload report error:", error);

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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all reports with filters and pagination
export const getAllReports = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      familyMemberId,
      reportType,
      startDate,
      endDate,
      status,
      isAnalyzed,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { userId };

    if (familyMemberId) filter.familyMemberId = familyMemberId;
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;
    if (isAnalyzed !== undefined)
      filter["aiAnalysis.isAnalyzed"] = isAnalyzed === "true";

    // Date range filter
    if (startDate || endDate) {
      filter.reportDate = {};
      if (startDate) filter.reportDate.$gte = new Date(startDate);
      if (endDate) filter.reportDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Get reports
    const reports = await MedicalReport.find(filter)
      .populate("familyMemberId", "name relation gender age")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalReports = await MedicalReport.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / parseInt(limit)),
        totalReports,
        reportsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single report by ID
export const getReportById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const report = await MedicalReport.findOne({ _id: id, userId }).populate(
      "familyMemberId",
      "name relation gender age dateOfBirth bloodGroup allergies chronicConditions"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report retrieved successfully",
      report,
    });
  } catch (error) {
    console.error("Get report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get reports by family member
export const getReportsByMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { memberId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify family member exists and belongs to user
    const familyMember = await FamilyMember.findOne({
      _id: memberId,
      userId,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reports
    const reports = await MedicalReport.find({
      userId,
      familyMemberId: memberId,
    })
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReports = await MedicalReport.countDocuments({
      userId,
      familyMemberId: memberId,
    });

    return res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      familyMember: {
        id: familyMember._id,
        name: familyMember.name,
        relation: familyMember.relation,
      },
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / parseInt(limit)),
        totalReports,
      },
    });
  } catch (error) {
    console.error("Get reports by member error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update report metadata
export const updateReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reportType, reportDate, hospitalName, doctorName, notes, tags } =
      req.body;

    const report = await MedicalReport.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Update fields if provided
    if (reportType) report.reportType = reportType;
    if (reportDate) report.reportDate = reportDate;
    if (hospitalName !== undefined) report.hospitalName = hospitalName;
    if (doctorName !== undefined) report.doctorName = doctorName;
    if (notes !== undefined) report.notes = notes;
    if (tags !== undefined) report.tags = Array.isArray(tags) ? tags : [tags];

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const report = await MedicalReport.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete file from Cloudinary
    try {
      await cloudinary.uploader.destroy(report.reportFile.publicId, {
        resource_type: report.reportFile.mimeType.includes("pdf")
          ? "raw"
          : "image",
      });
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
    }

    // Delete report from database
    await MedicalReport.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Search reports
export const searchReports = async (req, res) => {
  try {
    const userId = req.userId;
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Build search filter
    const searchFilter = {
      userId,
      $or: [
        { reportType: { $regex: query, $options: "i" } },
        { hospitalName: { $regex: query, $options: "i" } },
        { doctorName: { $regex: query, $options: "i" } },
        { notes: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search
    const reports = await MedicalReport.find(searchFilter)
      .populate("familyMemberId", "name relation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalResults = await MedicalReport.countDocuments(searchFilter);

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      query,
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / parseInt(limit)),
        totalResults,
      },
    });
  } catch (error) {
    console.error("Search reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get report statistics
export const getReportStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { memberId } = req.query;

    // Base filter
    const filter = { userId };
    if (memberId) filter.familyMemberId = memberId;

    // Get statistics
    const totalReports = await MedicalReport.countDocuments(filter);
    const analyzedReports = await MedicalReport.countDocuments({
      ...filter,
      "aiAnalysis.isAnalyzed": true,
    });
    const pendingAnalysis = totalReports - analyzedReports;

    // Get reports by type
    const reportsByType = await MedicalReport.aggregate([
      { $match: filter },
      { $group: { _id: "$reportType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get recent reports
    const recentReports = await MedicalReport.find(filter)
      .populate("familyMemberId", "name relation")
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "reportType reportDate hospitalName status aiAnalysis.isAnalyzed"
      );

    // Get date range
    const oldestReport = await MedicalReport.findOne(filter)
      .sort({ reportDate: 1 })
      .select("reportDate");

    const latestReport = await MedicalReport.findOne(filter)
      .sort({ reportDate: -1 })
      .select("reportDate");

    return res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      stats: {
        totalReports,
        analyzedReports,
        pendingAnalysis,
        reportsByType,
        recentReports,
        dateRange: {
          oldest: oldestReport?.reportDate || null,
          latest: latestReport?.reportDate || null,
        },
      },
    });
  } catch (error) {
    console.error("Get report stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Download report file
export const downloadReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const report = await MedicalReport.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Return file URL for download
    return res.status(200).json({
      success: true,
      message: "Report file retrieved successfully",
      file: {
        url: report.reportFile.url,
        fileName: report.reportFile.fileName,
        fileSize: report.reportFile.fileSize,
        mimeType: report.reportFile.mimeType,
      },
    });
  } catch (error) {
    console.error("Download report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
