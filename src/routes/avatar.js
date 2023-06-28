import express from "express";
import avatarController from "../controllers/avatar.js";
import {requireAuth} from "../middlewares/assertAuth.js";

const router = express.Router();

router.post("/create", avatarController.getSpecific);
router.get("/create", avatarController.getRandom);

router.get("/", requireAuth, avatarController.getAll);
router.get("/:id", requireAuth, avatarController.get);

router.post("/:id/like", requireAuth, avatarController.like);
router.post("/:id/visibility", requireAuth, avatarController.changeVisibility);
router.delete("/:id", requireAuth, avatarController.deleteAvatar);

export default router;