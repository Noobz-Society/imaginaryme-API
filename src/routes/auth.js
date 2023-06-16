const router = require("express").Router();
const authController = require("../controllers/auth");
const {requireAuth, requireAdmin} = require("../middlewares/assertAuth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/test-auth", requireAuth, authController.testAuth);
router.get("/test-admin", requireAdmin, authController.testAuth);

module.exports = router;