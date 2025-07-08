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

app.use(notFoundHandler);
app.use(errorHandler);
