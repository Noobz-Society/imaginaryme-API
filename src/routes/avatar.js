import express from "express";
import avatarController from "../controllers/avatar.js";

const router = express.Router();

router.post("/create", avatarController.getSpecific);
router.get("/create", avatarController.getRandom);

router.get("/all", avatarController.getAll);

// router.post("/", requireAuth ,avatarController.save);

export default router;