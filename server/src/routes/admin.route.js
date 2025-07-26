import Router from "express";
const router = Router();
import {
  deleteAdmin,
  getAdmin,
  updateAdmin,
} from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
router.route("/admin/:adminId/update").put(
  verifyJwt("admin"),
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  updateAdmin
);
router.route("/admin").post(verifyJwt("admin"), getAdmin);
router.route("/admin/:adminId/delete").delete(verifyJwt("admin"), deleteAdmin);
export default router;
