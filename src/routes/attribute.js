import express from "express";
import attributeController from "../controllers/attribute.js";
import {requireAdmin} from "../middlewares/assertAuth.js";

const router = express.Router();

router.get("/", attributeController.getAll);
router.put("/", requireAdmin, attributeController.create);
// router.patch("/:id", requireAdmin, attributeController.update);
// router.delete("/:id", requireAdmin, attributeController.delete);

router.put("/:id/variations", requireAdmin, attributeController.addVariations);
// router.patch("/:id/variations/:variationId", requireAdmin, attributeController.updateVariation);
// router.delete("/:id/variations/:variationId", requireAdmin, attributeController.deleteVariation);

router.put("/:id/colors", requireAdmin, attributeController.addColors);
// router.delete("/:id/colors/:color", requireAdmin, attributeController.deleteColor);

export default router;