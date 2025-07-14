import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import { User } from "../models/User.model.js";
import { wrapAsync } from "./wrapAsync.js";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not Found");
    }
    let accessToken = User.generateAccessToken();
    if (!accessToken) {
      throw new ApiError(
        500,
        "Something went wrong while generating the Access Token"
      );
    }

    let refreshToken = User.generateRefreshToken();
    if (!refreshToken) {
      throw new ApiError(500, "Failed to Generate Refresh Token");
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: refreshToken,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      throw new ApiError(500, "Failed to update refresh Token in User");
    }

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(error.status, error.message);
  }
};
