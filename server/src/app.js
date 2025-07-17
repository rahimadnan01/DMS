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
// route usage
app.use("/api/v1", adminAuthRoute);
app.use("/api/v1", adminRoute);
app.use(notFoundHandler);
app.use(errorHandler);
