import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
export const verifyJwt = (role) =>
  wrapAsync(async (req, res, next) => {
    try {
      const token =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer", "");
      if (token) {
        throw new ApiError(400, "Token not found : Invalid Credentials");
      }

      const decodedToken = jwt.verify(token.process.env.ACCESS_TOKEN_KEY);
      if (!decodedToken) {
        throw new ApiError(500, "Failed to decode token");
      }

      const user = await User.findById(decodedToken._id).select("-password");
      if (!user) {
        throw new ApiError(404, "User not Found");
      }

      if (role && role !== user.role) {
        throw new ApiError(401, "Access Denied Invalid Credentials");
      }

      req.user = user;
      next();
    } catch (error) {
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError" ||
        error.message === "User is unauthorized"
      ) {
        return next(new ApiError(401, "User is unauthorized or token expired"));
      }
      return next(new ApiError(500, error.message || "Authentication Failed"));
    }
  });
