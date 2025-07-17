import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/Admin.model.js";
import { User } from "../models/User.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { generateAccessAndRefreshToken } from "../utils/Tokens.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerAdmin = wrapAsync(async (req, res) => {
  let { username, email, password } = req.body;
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
  const { email, password } = req.body;
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

export const logoutAdmin = wrapAsync(async (req, res) => {
  const loggedOutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  let options = { httpOnly: true, secure: true };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged out successfully", loggedOutUser));
});

export const updateAdmin = wrapAsync(async (req, res) => {
  const { password, email } = req.body;
  const { adminId } = req.params;
  let userId = req.user._id;
  console.log(adminId);
  if (!adminId) {
    throw new ApiError(404, "admin not Found User is Unauthorized");
  }

  let user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found User is unauthorized");
  }

  const duplicateEmail = await User.findOne({ email: email });
  if (duplicateEmail) {
    throw new ApiError(401, "User already exists of This Email");
  }

  if (email) user.email = email;
  if (password) user.password = password;

  const updatedUser = await user.save({ validateBeforeSave: false });
  if (!updatedUser) {
    throw new ApiError(500, "failed to update Admin");
  }

  const admin = await Admin.findOne({ user: adminId });
  if (!admin) {
    throw new ApiError(404, "Admin  not found");
  }

  const profilePicPath = req.files?.profilePic[0]?.path;
  if (!profilePicPath) {
    throw new ApiError(404, "Path for Profile pic is required");
  }

  let profilePicUrl;
  if (profilePicPath) {
    profilePicUrl = await uploadOnCloudinary(profilePicPath);
  }

  if (profilePicUrl) admin.profilePic = profilePicUrl.url;
  let updatedAdmin = await admin.save();
  if (!updatedAdmin) {
    throw new ApiError(500, "Failed to update an Admin ");
  }

  res.json(
    new ApiResponse(200, "Admin updated successfully", {
      updatedAdmin: updatedAdmin,
      updatedUser: updatedUser,
    })
  );
});
