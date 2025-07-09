import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Specialty: {
      type: String,
      enum: [
        "General physician",
        "Gynecologist",
        "Dermatologist",
        "Pediatricians",
        "Neurologist",
        "Gastroenterologist",
      ],
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    Fee: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      required: true,
    },
    Education: {
      type: String,
      required: true,
    },
    About: {
      type: Required,
      maxLength: 150,
      required: true,
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export { Doctor };
