import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
const app = express();
app.use(
  cors({
    origin: [process.env.CORS],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
export { app };

// route declaration
import adminAuthRoute from "./routes/auth/adminAuth.route.js";
import adminRoute from "./routes/admin.route.js";
import userRoute from "./routes/User.route.js";
import doctorAuthRoute from "./routes/auth/doctorAuth.route.js";
import doctorRoute from "./routes/doctor.route.js";
import patientAuthRoute from "./routes/auth/patientAuth.route.js";
// route usage
app.use("/api/v1", adminAuthRoute);
app.use("/api/v1", adminRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", doctorAuthRoute);
app.use("/api/v1", doctorRoute);
app.use("/api/v1", patientAuthRoute);
app.use(notFoundHandler);
app.use(errorHandler);
