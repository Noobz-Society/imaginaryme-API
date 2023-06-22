import express from "express";
import authController from "../controllers/auth.js";
import {requireAdmin, requireAuth} from "../middlewares/assertAuth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/test-auth", requireAuth, authController.testAuth);
router.get("/test-admin", requireAdmin, authController.testAuth);

export default router;