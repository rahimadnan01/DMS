import Router from "express";
import {
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../../controllers/admin.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/admin/register").post(registerAdmin);
router.route("/admin/login").post(loginAdmin);
router.route("/admin/logout").post(verifyJwt(), logoutAdmin);
export default router;
