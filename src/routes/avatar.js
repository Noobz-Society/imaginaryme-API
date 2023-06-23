import express from "express";
import avatarController from "../controllers/avatar.js";
import {requireAuth} from "../middlewares/assertAuth.js";

const router = express.Router();

router.post("/create", avatarController.getSpecific);
router.get("/create", avatarController.getRandom);

router.get("/all", requireAuth, avatarController.getAll);

// router.post("/", requireAuth ,avatarController.save);

export default router;