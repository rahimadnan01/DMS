import Router from "express";
import { getOnePatient } from "../controllers/Patient.controller.js";
const router = Router();
router.route("/patient/:patientId").get(getOnePatient);
export default router;
