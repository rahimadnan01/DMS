import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Doctor } from "../models/Doctor.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { generateAccessAndRefreshToken } from "../utils/Tokens.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const addDoctor = wrapAsync(async (req, res) => {
  let {
    username,
    email,
    password,
    Specialty,
    experience,
    Fee,
    Address,
    Education,
    About,
  } = req.body;

  console.log("body:", req.body);
  console.log("file:", req.files);
  if (
    !username ||
    !email ||
    !password ||
    !Specialty ||
    !experience ||
    !Fee ||
    !Address ||
    !Education ||
    !About
  ) {
    throw new ApiError(401, "All fields are required");
  }

  let profilePicPath = req.files?.profilePic[0]?.path;
  if (!profilePicPath) {
    throw new ApiError(401, "Profile Pic is required");
  }

  let ProfilePicUrl = await uploadOnCloudinary(profilePicPath);
  if (!ProfilePicUrl) {
    throw new ApiError(500, "failed to upload image on Cloudinary");
  }

  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    throw new ApiError(401, "User already exists");
  }

  const user = await User.create({
    username: username,
    email: email,
    password: password,
    role: "doctor",
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  const doctor = await Doctor.create({
    user: user._id,
    Specialty: Specialty,
    experience: experience,
    Fee: Fee,
    Address: Address,
    Education: Education,
    About: About,
    profilePic: ProfilePicUrl.url,
  });

  const createdDoctor = await Doctor.findById(doctor._id).populate({
    path: "user",
    populate: "username email",
  });
  if (!createdDoctor) {
    throw new ApiError(401, "Failed to create a Doctor");
  }

  res.json(
    new ApiResponse(200, "Doctor registered Successfully", {
      user,
      createdDoctor,
    })
  );
});

export const loginDoctor = wrapAsync(async (req, res) => {
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

  if (user.role && user.role !== "doctor") {
    throw new ApiError(403, "Access denied User is not a doctor");
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
    throw new ApiError(500, "Failed to login a Doctor");
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

export const logoutDoctor = wrapAsync(async (req, res) => {
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

export const deleteDoctor = wrapAsync(async (req, res) => {
  const { doctorId } = req.params;
  if (!doctorId) {
    throw new ApiError(404, "User not found");
  }

  const doctor = await Doctor.findOne({ user: doctorId });
  if (!doctor) {
    throw new ApiError(404, "Doctor not found of this Id");
  }
  const deletedUser = await User.findOneAndDelete({ _id: doctorId });
  if (!deletedUser) {
    throw new ApiError(500, "Failed to delete an User");
  }
  const deletedDoctor = await Doctor.findByIdAndDelete(doctor._id);
  if (!deletedDoctor) {
    throw new ApiError(500, "Failed to delete a Doctor");
  }

  res.status(200).json(
    new ApiResponse(200, "Doctor deleted successfully", {
      deletedUser: deletedUser,
      deletedDoctor: deletedDoctor,
    })
  );
});

export const getOneDoctor = wrapAsync(async (req, res) => {
  const user = req.user;
  const { doctorId } = req.params;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const doctor = await Doctor.findOne({ user: doctorId });
  if (!doctor) {
    throw new ApiError(404, "Doctor not found of this Id");
  }

  res.status(200).json(
    new ApiResponse(200, "Doctor Shown successfully", {
      user: user,
      doctor: doctor,
    })
  );
});

export const getAllDoctors = wrapAsync(async (req, res) => {
  const allDoctors = await Doctor.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
  ]);
  if (!allDoctors) {
    throw new ApiError(404, "No doctors found in Database");
  }
  res.status(200).json(
    new ApiResponse(200, "All doctors shown successfully ", {
      doctors: allDoctors,
    })
  );
});

export const deleteAllDoctors = wrapAsync(async (req, res) => {
  const allDeletedDoctors = await Doctor.deleteMany({});
  const allDeletedUsers = await User.deleteMany({ role: "doctor" });
  if (deleteAllDoctors < 0) {
    throw new ApiError(401, "No doctors found to delete");
  }
  if (!allDeletedUsers) {
    throw new ApiError(500, "Failed to delete all users having role doctors");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All doctors deleted successfully",
        allDeletedDoctors
      )
    );
});

export const updateDoctor = wrapAsync(async (req, res) => {
  let userId = req.user._id;
  let { doctorId } = req.params;
  if (!doctorId) {
    throw new ApiError(404, "Doctor of this id not found");
  }

  let {
    username,
    email,
    password,
    Specialty,
    experience,
    Fee,
    Address,
    Education,
    About,
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "No user found of this Id");
  }

  if (username) user.username = username;
  if (password) user.password = password;
  if (email) user.email = email;

  let updatedUser = await user.save({ validateBeforeSave: false });

  if (!updatedUser) {
    throw new ApiError(500, "Failed to update a User");
  }
  let doctor = await Doctor.findOne({ user: doctorId });

  let profilePicPath = req.files?.profilePic[0]?.path;
  if (!profilePicPath) {
    throw new ApiError(401, "Path for Profile Path is required");
  }

  let profilePic = await uploadOnCloudinary(profilePicPath);
  if (!profilePic) {
    throw new ApiError(500, "Failed to upload an image");
  }

  if (!doctor) {
    throw new ApiError(404, "No Doctor found of this Id");
  }

  if (Specialty) doctor.Specialty = Specialty;
  if (experience) doctor.experience = experience;
  if (Fee) doctor.Fee = Fee;
  if (Address) doctor.Address = Address;
  if (Education) doctor.Education = Education;
  if (About) doctor.About = About;
  if (profilePic) doctor.profilePic = profilePic.url;

  const updatedDoctor = await doctor.save();

  if (!updatedDoctor) {
    throw new ApiError(500, "Failed to update A Doctor");
  }

  res.status(200).json(
    new ApiResponse(200, "Doctor Updated successfully", {
      updatedUser: updatedUser,
      updatedDoctor: updatedDoctor,
    })
  );
});
