import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin, User } from "../models/Admin.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { generateAccessAndRefreshToken } from "../utils/Tokens.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerAdmin = wrapAsync(async (req, res) => {
  let { username, email, password } = req.params;
  if (!username || !email || !password) {
    throw new ApiError(401, "All fields are required");
  }

  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    throw new ApiError(401, "User already exists");
  }

  const user = await User.create({
    username: username,
    email: email,
    password: password,
    role: "admin",
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  const admin = await Admin.create({
    user: user._id,
  });

  const createdAdmin = await Admin.findById(admin._id).populate({
    path: "user",
    populate: "username email",
  });
  if (!createdAdmin) {
    throw new ApiError(401, "Failed to create an admin");
  }

  res.json(
    new ApiResponse(200, "Admin registered Successfully", {
      user,
      createdAdmin,
    })
  );
});

export const loginAdmin = wrapAsync(async (req, res) => {

  const { email, password } = req.params;
  if (!email || !password) {
    throw new ApiError(401, "All fields are required");
  }

  let user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(403, "Invalid credentials User not exists");
  }

  let isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(403, "Password is Incorrect");
  }

  if (user.role && user.role !== "admin") {
    throw new ApiError(403, "Access denied User is not an admin");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(401, "Failed to generate Access And refresh Token");
  }

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Failed to login an Admin");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV || "production",
    sameSite: "None",
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in Successfully", {
        loggedInUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
});
