import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,

  params: async () => {
    return {
      folder: "novamarket",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    };
  },
});

export const upload = multer({
  storage,
});

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
export default cloudinary;
