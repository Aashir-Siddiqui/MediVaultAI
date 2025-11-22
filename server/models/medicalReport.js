import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    // Reference fields
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Report basic info
    reportType: {
      type: String,
      enum: [
        "Blood Test",
        "X-Ray",
        "MRI Scan",
        "CT Scan",
        "Ultrasound",
        "ECG",
        "EEG",
        "Urine Test",
        "Stool Test",
        "Thyroid Test",
        "Diabetes Test",
        "Liver Function Test",
        "Kidney Function Test",
        "Lipid Profile",
        "Complete Blood Count",
        "Biopsy",
        "Endoscopy",
        "Colonoscopy",
        "Mammography",
        "Bone Density Scan",
        "Pulmonary Function Test",
        "Other",
      ],
      required: true,
    },

    reportDate: {
      type: Date,
      required: true,
    },

    // Medical facility info
    hospitalName: {
      type: String,
      trim: true,
      default: "",
    },

    doctorName: {
      type: String,
      trim: true,
      default: "",
    },

    // File information
    reportFile: {
      url: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },

    // Extracted content
    extractedText: {
      type: String,
      default: "",
    },

    // AI Analysis results
    aiAnalysis: {
      summary: {
        type: String,
        default: "",
      },
      keyFindings: {
        type: [String],
        default: [],
      },
      abnormalValues: [
        {
          parameter: String,
          value: String,
          normalRange: String,
          severity: {
            type: String,
            enum: ["Normal", "Slightly Abnormal", "Abnormal", "Critical"],
            default: "Normal",
          },
        },
      ],
      recommendations: {
        type: [String],
        default: [],
      },
      healthInsights: {
        type: String,
        default: "",
      },
      nextSteps: {
        type: [String],
        default: [],
      },
      analyzedAt: {
        type: Date,
        default: null,
      },
      isAnalyzed: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    tags: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

    // Sharing & visibility
    isShared: {
      type: Boolean,
      default: false,
    },

    sharedWith: [
      {
        email: String,
        sharedAt: Date,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["Uploaded", "Processing", "Analyzed", "Failed"],
      default: "Uploaded",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for faster queries
medicalReportSchema.index({ userId: 1, familyMemberId: 1 });
medicalReportSchema.index({ userId: 1, reportType: 1 });
medicalReportSchema.index({ userId: 1, reportDate: -1 });
medicalReportSchema.index({ createdAt: -1 });

// Virtual field to get family member name
medicalReportSchema.virtual("familyMemberName", {
  ref: "FamilyMember",
  localField: "familyMemberId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included
medicalReportSchema.set("toJSON", { virtuals: true });
medicalReportSchema.set("toObject", { virtuals: true });

const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema);
export default MedicalReport;
