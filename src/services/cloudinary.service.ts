import cloudinary from "../config/cloudinary.config";

export const deleteImageFromCloudinary = async (imageUrl: string) => {
  const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
  await cloudinary.uploader.destroy(publicId);
};
