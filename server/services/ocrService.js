// services/ocrService.js
import Tesseract from "tesseract.js";
import { PDFParse } from "pdf-parse"; // FIXED import
import fs from "fs";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";

// Extract text from image using Tesseract OCR
export const extractTextFromImage = async (imagePath) => {
  try {
    console.log("Starting OCR for image:", imagePath);

    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng", {
      logger: (info) => {
        if (info.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });

    console.log("✅ OCR completed successfully");
    return text.trim();
  } catch (error) {
    console.error("❌ Image OCR error:", error);
    throw new Error("Failed to extract text from image");
  }
};

// Extract text from PDF - FIXED
export const extractTextFromPDF = async (pdfPath) => {
  try {
    console.log("Starting PDF text extraction:", pdfPath);

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await PDFParse(dataBuffer); // FIXED: Direct call

    console.log("✅ PDF text extraction completed");
    console.log("Extracted text length:", data.text?.length || 0);

    if (!data.text || data.text.trim().length === 0) {
      console.warn(
        "⚠️  No text found in PDF. This might be an image-based PDF."
      );
      throw new Error(
        "No text content found in PDF. This appears to be an image-based PDF."
      );
    }

    return data.text.trim();
  } catch (error) {
    console.error("❌ PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

// Download from Cloudinary using SDK
export const downloadFromCloudinary = async (
  publicId,
  filepath,
  resourceType = "auto"
) => {
  try {
    console.log("📥 Downloading from Cloudinary:", publicId);

    // Generate URL without authentication (for public files)
    const url = cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
      type: "upload", // Ensure it's looking for upload type
    });

    console.log("🔗 Cloudinary URL:", url);

    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Health Records System)",
      },
      maxRedirects: 5,
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log("✅ File downloaded successfully");
        resolve(filepath);
      });

      writer.on("error", (err) => {
        console.error("❌ Writer error:", err);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(err);
      });
    });
  } catch (error) {
    console.error("❌ Cloudinary download error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    throw new Error(`Failed to download from Cloudinary: ${error.message}`);
  }
};

// Main function to extract text from any file - OPTIMIZED
export const extractTextFromFile = async (
  fileUrl,
  mimeType,
  publicId = null
) => {
  let tempFilePath = null;

  try {
    // Create temp directory
    const tempDir = "./public/temp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate temp file path
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = mimeType.includes("pdf") ? "pdf" : "jpg";
    tempFilePath = `${tempDir}/temp_${timestamp}_${random}.${extension}`;

    console.log("📄 Processing file:", {
      mimeType,
      hasPublicId: !!publicId,
      extension,
    });

    // Download file
    if (publicId) {
      try {
        console.log("🔄 Attempting Cloudinary SDK download");
        const resourceType = mimeType.includes("pdf") ? "raw" : "image";
        await downloadFromCloudinary(publicId, tempFilePath, resourceType);
      } catch (cloudinaryError) {
        console.warn("⚠️  Cloudinary SDK failed, trying direct URL");
        console.error("Cloudinary error:", cloudinaryError.message);

        // Fallback: direct URL download
        await downloadFromCloudinary(publicId, tempFilePath, "auto");
      }
    } else {
      throw new Error("PublicId is required for file download");
    }

    // Verify file
    if (!fs.existsSync(tempFilePath)) {
      throw new Error("File download failed - file not found");
    }

    const fileStats = fs.statSync(tempFilePath);
    console.log("📊 Downloaded file size:", fileStats.size, "bytes");

    if (fileStats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    let extractedText = "";

    // Extract text based on file type
    if (mimeType.includes("pdf")) {
      console.log("📖 Processing as PDF");
      extractedText = await extractTextFromPDF(tempFilePath);
    } else if (mimeType.includes("image")) {
      console.log("🖼️  Processing as Image with OCR");
      extractedText = await extractTextFromImage(tempFilePath);
    } else {
      throw new Error("Unsupported file type for text extraction");
    }

    console.log("✅ Text extraction successful. Length:", extractedText.length);

    return extractedText;
  } catch (error) {
    console.error("❌ Text extraction error:", error);
    throw error;
  } finally {
    // Always clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("🗑️  Temp file deleted");
      } catch (err) {
        console.error("⚠️  Error deleting temp file:", err);
      }
    }
  }
};

// Clean and format extracted text
export const cleanExtractedText = (text) => {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ") // Multiple spaces → single space
    .replace(/\n+/g, "\n") // Multiple newlines → single newline
    .trim();
};
