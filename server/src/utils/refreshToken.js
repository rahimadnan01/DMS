import { User } from "../models/User.model.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import jwt from "jsonwebtoken";
import { wrapAsync } from "./wrapAsync.js";
import { generateAccessAndRefreshToken } from "./Tokens.js";

export const refreshTokens = wrapAsync(async (req, res) => {
  const upcomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!upcomingRefreshToken) {
    throw new ApiError(400, "User  is unauthorized");
  }

  let verifyToken;

  try {
    verifyToken =  jwt.verify(
      upcomingRefreshToken,
      process.env.REFRESH_TOKEN_KEY
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  const user = await User.findById(verifyToken._id);
  if (!user) {
    throw new ApiError(400, "User is unauthorized");
  }

  if (user && user.refreshToken !== upcomingRefreshToken) {
    throw new ApiError(400, "User is unauthorized");
  }

  let { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  if (!accessToken || !newRefreshToken) {
    throw new ApiError(500, "Failed to refresh the tokens");
  }

  let options = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, "Tokens refreshed successfully", {
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      })
    );
});
