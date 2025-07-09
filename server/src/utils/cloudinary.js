import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      console.log("file not found", localFilePath);
      return null;
    }

    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("failed to upload image due to some error ", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};
