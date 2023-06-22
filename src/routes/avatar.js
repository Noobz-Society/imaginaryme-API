import express from "express";
import avatarController from "../controllers/avatar.js";

const router = express.Router();

router.post("/create", avatarController.getSpecific);
router.get("/create", avatarController.getRandom);

export default router;