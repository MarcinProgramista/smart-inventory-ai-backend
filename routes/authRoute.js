import express from "express";
import { handleLogin } from "../controllers/authController.js";
import { getRefreshToken } from "../controllers/refreshTokenController.js";
import { handleLogout } from "../controllers/logoutController.js";

const router = express.Router();
router.post("/login", handleLogin);
router.get("/refresh_token", getRefreshToken);
router.delete("/logout", handleLogout);

export default router;
