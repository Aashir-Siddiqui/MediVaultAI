import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    relation: {
      type: String,
      enum: ["Self", "Father", "Mother", "Spouse", "Child", "Other"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null,
    },

    allergies: {
      type: [String],
      default: [],
    },

    chronicConditions: {
      type: [String],
      default: [],
    },

    emergencyContact: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries by userId and relation
familyMemberSchema.index({ userId: 1, relation: 1 });

// Index for date queries
familyMemberSchema.index({ createdAt: -1 });

// Virtual field to calculate age
familyMemberSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Ensure virtuals are included in JSON
familyMemberSchema.set("toJSON", { virtuals: true });
familyMemberSchema.set("toObject", { virtuals: true });

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);
export default FamilyMember;
