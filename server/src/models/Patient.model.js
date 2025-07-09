import mongoose from "mongoose";
const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    phoneNumber: {
      type: String,
    },
    Address: {
      type: String,
    },
    Gender: {
      type: String,
      enum: ["Male", "Female", "Custom"],
    },
    dateOfBirth: {
      type: Date,
    },
    Appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    Age: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export { Patient };
