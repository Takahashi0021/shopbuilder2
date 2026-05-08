const { Router } = require("express");
const { authLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const { authenticate } = require("../middlewares/auth");
const {
  registerSchema, loginSchema, refreshSchema,
  forgotPasswordSchema, resetPasswordSchema
} = require("../validators/auth.validators");
const controller = require("../controllers/auth.controller");

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.get("/verify-email", controller.verifyEmail);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refreshToken);
router.post("/logout", validate(refreshSchema), controller.logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);
router.get("/me", authenticate, controller.me);

module.exports = router;
