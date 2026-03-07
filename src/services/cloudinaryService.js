import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer directly to Cloudinary
 * This avoids saving to disk first!
 */
export const uploadToCloudinary = (
  fileBuffer,
  fileName,
  folder = "hr-reports",
) => {
  return new Promise((resolve, reject) => {
    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
        resource_type: "raw", // For DOCX files
        use_filename: true,
        unique_filename: true,
        access_mode: "public", // Will be protected by signed URLs
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Generate a signed URL with expiration
 * This ensures only authenticated users can access files
 */
export const getSignedUrl = (publicId, expiresInSeconds = 3600) => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
};

/**
 * Delete a file from Cloudinary
 */
export const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
};
