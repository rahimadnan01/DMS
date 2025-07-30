import Router from "express";
import {
  deleteAllPatients,
  deleteOnePatient,
  getAllPatients,
  getOnePatient,
} from "../controllers/Patient.controller.js";
const router = Router();
router.route("/patient/:patientId").get(getOnePatient).delete(deleteOnePatient);
router.route("/patient").get(getAllPatients).delete(deleteAllPatients);
export default router;
