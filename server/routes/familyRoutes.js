import express from "express";
import authenticateUser from "../middleware/userAuth.js";
import { upload } from "../config/multer.js";
import {
  addFamilyMember,
  getAllFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  uploadFamilyMemberImage,
  deleteFamilyMemberImage,
  deleteFamilyMember,
  getFamilyMemberStats,
} from "../controllers/familyController.js";

const familyRouter = express.Router();

// All routes require authentication
familyRouter.use(authenticateUser);

familyRouter.post("/add", addFamilyMember);

familyRouter.get("/all", getAllFamilyMembers);

familyRouter.get("/:id", getFamilyMemberById);

familyRouter.put("/:id", updateFamilyMember);

familyRouter.delete("/:id", deleteFamilyMember);

// Profile image routes
familyRouter.post(
  "/:id/image",
  upload.single("profileImage"),
  uploadFamilyMemberImage
);

familyRouter.delete("/:id/image", deleteFamilyMemberImage);

// Statistics route
familyRouter.get("/:id/stats", getFamilyMemberStats);

export default familyRouter;
