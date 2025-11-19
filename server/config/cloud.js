// In reportController.js - Update uploadReport function

// Upload to Cloudinary with PUBLIC access
const result = await cloudinary.uploader.upload(req.file.path, {
  folder: "health-records/medical-reports",
  resource_type: "auto",
  type: "upload", // Public upload type
  access_mode: "public", // Make it publicly accessible
});

console.log("Uploaded to Cloudinary:", {
  url: result.secure_url,
  publicId: result.public_id,
  resourceType: result.resource_type,
});

// Also update multer.js for reportUpload
export const reportUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for medical reports
  },
  fileFilter: fileFilter,
});
