import Router from "express";
import {
  loginPatient,
  logoutPatient,
  registerPatient,
} from "../../controllers/Patient.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
const router = Router();
router.route("/patient/register").post(registerPatient);
router.route("/patient/login").post(loginPatient);
router.route("/patient/logout").post(verifyJwt("patient"), logoutPatient);
export default router;
