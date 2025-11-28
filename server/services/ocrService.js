import Tesseract from "tesseract.js";
import fs from "fs";
import https from "https";

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

// Download file from URL
export const downloadFile = async (url, filepath) => {
  return new Promise((resolve, reject) => {
    console.log("📥 Downloading file from URL:", url);

    const file = fs.createWriteStream(filepath);

    const request = https.get(
      url,
      {
        timeout: 60000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Health Records System)",
        },
      },
      (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlinkSync(filepath);
          console.log("🔄 Following redirect to:", response.headers.location);
          return downloadFile(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(filepath);
          return reject(
            new Error(`Failed to download: HTTP ${response.statusCode}`)
          );
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          const stats = fs.statSync(filepath);
          console.log(
            "✅ File downloaded successfully, size:",
            stats.size,
            "bytes"
          );

          if (stats.size === 0) {
            fs.unlinkSync(filepath);
            return reject(new Error("Downloaded file is empty"));
          }

          resolve(filepath);
        });
      }
    );

    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });

    request.on("timeout", () => {
      request.destroy();
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(new Error("Download timeout"));
    });

    file.on("error", (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
};

// Main function to extract text from image file
export const extractTextFromFile = async (
  fileUrl,
  mimeType,
  publicId = null
) => {
  let tempFilePath = null;

  try {
    // Verify it's an image
    if (!mimeType.includes("image")) {
      throw new Error("Only image files are supported");
    }

    // Create temp directory
    const tempDir = "./public/temp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate temp file path
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = "jpg";
    tempFilePath = `${tempDir}/temp_${timestamp}_${random}.${extension}`;

    console.log("📄 Processing image file:", {
      mimeType,
      fileUrl: fileUrl.substring(0, 50) + "...",
    });

    // Download file using direct URL
    await downloadFile(fileUrl, tempFilePath);

    // Verify file exists and has content
    if (!fs.existsSync(tempFilePath)) {
      throw new Error("File download failed - file not found");
    }

    const fileStats = fs.statSync(tempFilePath);
    console.log("📊 Downloaded file size:", fileStats.size, "bytes");

    if (fileStats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    // Extract text using OCR
    console.log("🖼️ Processing image with OCR");
    const extractedText = await extractTextFromImage(tempFilePath);

    console.log("✅ Text extraction successful. Length:", extractedText.length);

    if (!extractedText || extractedText.length < 50) {
      throw new Error("Insufficient text extracted from image");
    }

    return extractedText;
  } catch (error) {
    console.error("❌ Text extraction error:", error);
    throw error;
  } finally {
    // Always clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("🗑️ Temp file deleted");
      } catch (err) {
        console.error("⚠️ Error deleting temp file:", err);
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
    .replace(/\r/g, "") // Remove carriage returns
    .trim();
};
