import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Patient } from "../models/Patient.model.js";
import { User } from "../models/User.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { generateAccessAndRefreshToken } from "../utils/Tokens.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerPatient = wrapAsync(async (req, res) => {
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
    role: "patient",
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  const patient = await Patient.create({
    user: user._id,
  });

  const createdPatient = await Patient.findById(patient._id).populate({
    path: "user",
    populate: "username email",
  });
  if (!createdPatient) {
    throw new ApiError(401, "Failed to create a Patient");
  }

  res.json(
    new ApiResponse(200, "Patient registered Successfully", {
      user,
      createdPatient,
    })
  );
});

export const loginPatient = wrapAsync(async (req, res) => {
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

  if (user.role && user.role !== "patient") {
    throw new ApiError(403, "Access denied User is not a Patient");
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

export const logoutPatient = wrapAsync(async (req, res) => {
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

export const getOnePatient = wrapAsync(async (req, res) => {
  const { patientId } = req.params;
  if (!patientId) {
    throw new ApiError(401, "Patient not found of this Id");
  }

  const user = await User.findById(patientId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const patient = await Patient.findOne({ user: user._id });
  if (!patient) {
    throw new ApiError(500, "Failed to get Patient");
  }

  res.status(200).json(
    new ApiResponse(200, "Patient shown successfully", {
      user: user,
      patient: patient,
    })
  );
});
