import express from "express";
import userController from "../controllers/user.js";
import {requireAuth} from "../middlewares/assertAuth.js";

const router = express.Router();

router.get("/:userId/avatars", requireAuth, userController.getAvatars)

export default router;