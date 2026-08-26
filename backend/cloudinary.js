// cloudinary.js
// Cloudinary stores your painting photos on THEIR servers permanently,
// so they survive backend restarts/redeploys — unlike Render's free tier,
// which has no persistent disk and wipes uploaded files on every restart.
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads an in-memory file buffer to Cloudinary
export function uploadImageBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "paintings-marketplace" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}


export default cloudinary;
