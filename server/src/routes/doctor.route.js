import Router from "express";
import { addDoctor, deleteDoctor } from "../controllers/doctor.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/doctor/add").post(
  verifyJwt("admin"),
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  addDoctor
);
router
  .route("/doctor/:doctorId/delete")
  .delete(verifyJwt("admin"), deleteDoctor);

export default router;
