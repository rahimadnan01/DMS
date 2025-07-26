import Router from "express";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import {

  loginDoctor,
  logoutDoctor,
} from "../../controllers/doctor.controller.js";
const router = Router();

router.route("/doctor/login").post(loginDoctor);
router.route("/doctor/logout").post(verifyJwt(), logoutDoctor);
export default router;
