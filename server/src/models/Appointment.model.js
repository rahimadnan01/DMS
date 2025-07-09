import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema(
  {
    Doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    Patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    Date: {
      type: Date,
      required: true,
    },
    Time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export { Appointment };
