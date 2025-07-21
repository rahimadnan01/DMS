import Router from "express";
const router = Router();
import { refreshTokens } from "../utils/refreshToken.js";
router.route("/refreshToken").post(refreshTokens);
export default router;
