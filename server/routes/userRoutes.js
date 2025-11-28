import express from "express";
import authenticateUser from "../middleware/userAuth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../config/multer.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../validators/userSchema.js";
import {
  getUserData,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  changePassword,
  deleteAccount,
  getAccountStats,
} from "../controllers/userController.js";

const userRouter = express.Router();

// All routes require authentication
userRouter.use(authenticateUser);

// Profile routes
userRouter.get("/profile", getUserData);
userRouter.put("/profile", validate(updateProfileSchema), updateProfile);
userRouter.get("/stats", getAccountStats);

// Profile picture routes
userRouter.post(
  "/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);
userRouter.delete("/profile-picture", deleteProfilePicture);

// Security routes
userRouter.post(
  "/change-password",
  validate(changePasswordSchema),
  changePassword
);
userRouter.delete(
  "/delete-account",
  validate(deleteAccountSchema),
  deleteAccount
);

export default userRouter;
