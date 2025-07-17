import Router from "express";
const router = Router();
import { updateAdmin } from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
router.route("/admin/:adminId/update").put(
  verifyJwt(),
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  updateAdmin
);

export default router;
